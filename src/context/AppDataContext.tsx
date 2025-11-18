import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { Habit, Task, AppEvent, UserProfile, ScheduledItem, Break } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { User, onAuthStateChanged, signOut, updateProfile as updateAuthProfile } from 'firebase/auth';
import { usePersistentAuth } from '@/hooks/use-persistent-auth';
import { useTokenRefresh } from '@/hooks/use-token-refresh';
import { useSessionExtension } from '@/hooks/use-session-extension';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  setDoc,
  getDoc,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { format } from 'date-fns';

// Auth Context
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  login: (credentials: { email: string; password: string }, rememberMe?: boolean) => Promise<{ success: boolean; user?: User; error?: string }>;
  signup: (credentials: { email: string; password: string; displayName?: string }, rememberMe?: boolean) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUserProfile: (data: { displayName?: string, photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppDataProvider');
  }
  return context;
};


// App Data Context
interface AppDataContextType {
  habits: Habit[];
  tasks: Task[];
  events: AppEvent[];
  breaks: Break[];
  completions: Record<string, boolean>;
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addEvent: (event: Omit<AppEvent, 'id'>) => Promise<void>;
  updateEvent: (event: AppEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  completeEvent: (eventId: string) => Promise<void>;
  addBreak: (newBreak: Omit<Break, 'id'>) => Promise<void>;
  updateBreak: (updatedBreak: Break) => Promise<void>;
  deleteBreak: (breakId: string) => Promise<void>;
  toggleCompletion: (itemId: string, date: Date) => Promise<void>;
  updateScheduledItemTime: (item: ScheduledItem, date: Date, time: string | null, endTime?: string | null) => Promise<void>;
  duplicateScheduledItem: (item: ScheduledItem, date: Date, time: string, endTime?: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const dataToFirestore = (data: any) => {
    const firestoreData: any = {};
    for (const key in data) {
        const value = data[key];
        if (value instanceof Date) {
            firestoreData[key] = Timestamp.fromDate(value);
        } else if (value === undefined) {
            // Firestore doesn't like undefined. We either convert to null or remove the key.
            // Let's convert to null.
            firestoreData[key] = null;
        } else {
            firestoreData[key] = value;
        }
    }
    return firestoreData;
};


const dataFromFirestore = (doc: any) => {
    const data = doc.data();
    if (!data) return null;

    const convertedData: any = { id: doc.id };
    for (const key in data) {
        const value = data[key];
        if (value instanceof Timestamp) {
            convertedData[key] = value.toDate();
        } else {
            convertedData[key] = value;
        }
    }
    return convertedData;
};

// Provider Component
export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const persistentAuth = usePersistentAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Usar o hook de renovação de tokens
  useTokenRefresh(user);
  
  // Usar o hook de extensão de sessão
  useSessionExtension(user);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  
  // Sincronizar com o hook de autenticação persistente
  useEffect(() => {
    setUser(persistentAuth.user);
    setLoading(persistentAuth.loading);
  }, [persistentAuth.user, persistentAuth.loading]);

  useEffect(() => {
    const loadUserProfile = async (currentUser: User) => {
      setLoading(true);
      console.log('Loading user profile for:', currentUser.uid);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const profileData = { uid: currentUser.uid, ...docSnap.data() } as UserProfile;
        console.log('User profile found:', profileData);
        setUserProfile(profileData);
      } else {
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || `User-${currentUser.uid.substring(0,5)}`,
          photoURL: currentUser.photoURL || '',
        };
        console.log('Creating new user profile:', newProfile);
        try {
          await setDoc(userDocRef, newProfile);
          console.log('User profile created successfully');
          setUserProfile(newProfile);
        } catch (error) {
          console.error('Error creating user profile:', error);
          // Set profile anyway to avoid blocking the app
          setUserProfile(newProfile);
        }
      }
      setLoading(false);
    };

    if (persistentAuth.user) {
      loadUserProfile(persistentAuth.user);
    } else {
      setUser(null);
      setUserProfile(null);
      setHabits([]);
      setTasks([]);
      setEvents([]);
      setBreaks([]);
      setCompletions({});
      setLoading(false);
    }
  }, [persistentAuth.user]);

  useEffect(() => {
    if (!user) {
      if (!auth.currentUser) setLoading(false);
      return;
    }
    
    let isMounted = true;
    const unsubscribes: (() => void)[] = [];
    
    let activeListeners = 0;
    const totalListeners = 5; // habits, tasks, events, completions, breaks

    const onSubscribed = () => {
        activeListeners++;
        if (activeListeners === totalListeners && isMounted) {
            setLoading(false);
        }
    };

    const setupSubscription = <T,>(collectionName: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
        const q = collection(db, 'users', user.uid, collectionName);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (isMounted) {
                const items = snapshot.docs.map(dataFromFirestore) as T[];
                setter(items);
            }
        }, (error) => console.error(`Error fetching ${collectionName}:`, error));
        unsubscribes.push(unsubscribe);
        onSubscribed();
    };

    setupSubscription('habits', setHabits);
    setupSubscription('tasks', setTasks);
    setupSubscription('events', setEvents);
    setupSubscription('breaks', setBreaks);

    const completionsQuery = collection(db, 'users', user.uid, 'completions');
    const unsubscribeCompletions = onSnapshot(completionsQuery, (snapshot) => {
        if(isMounted) {
            const completionMap: Record<string, boolean> = {};
            snapshot.docs.forEach(doc => {
                completionMap[doc.id] = doc.data().completed;
            });
            setCompletions(completionMap);
        }
    }, (error) => console.error(`Error fetching completions:`, error));
    unsubscribes.push(unsubscribeCompletions);
    onSubscribed();


    return () => {
      isMounted = false;
      unsubscribes.forEach(unsub => unsub());
    };
}, [user]);

  const logout = useCallback(async () => {
    await persistentAuth.logout();
  }, [persistentAuth]);

 const updateUserProfile = useCallback(async (data: { displayName?: string, photoURL?: string }) => {
    if (!user) {
      console.error('No user found for profile update');
      return Promise.resolve();
    }

    console.log('Updating user profile with data:', data);
    console.log('Current userProfile:', userProfile);

    const profileUpdates: { displayName?: string, photoURL?: string } = {};

    // Handle photo upload - skip if data URL is too long
    if (data.photoURL && data.photoURL !== userProfile?.photoURL) {
      if (data.photoURL.startsWith('data:') && data.photoURL.length > 2000) {
        console.log('Data URL too long, attempting Cloudinary upload...');
        try {
          const cloudinaryUrl = await uploadImageToCloudinary(data.photoURL, user.uid);
          console.log('Cloudinary URL received:', cloudinaryUrl);
          profileUpdates.photoURL = cloudinaryUrl;
        } catch (error) {
          console.error('Error uploading to Cloudinary:', error);
          console.log('Skipping photo update due to upload error');
          // Don't update photo if Cloudinary fails
        }
      } else if (!data.photoURL.startsWith('data:')) {
        // Regular URL - check length
        if (data.photoURL.length > 2000) {
          console.log('Photo URL too long for Firebase Auth, skipping...');
        } else {
          profileUpdates.photoURL = data.photoURL;
        }
      } else {
        // Short data URL - use directly
        profileUpdates.photoURL = data.photoURL;
      }
    }

    if (data.displayName && data.displayName !== userProfile?.displayName) {
        profileUpdates.displayName = data.displayName;
    }

    console.log('Profile updates to apply:', profileUpdates);

    if (Object.keys(profileUpdates).length > 0) {
        try {
            // Update Firebase Auth profile
            await updateAuthProfile(user, profileUpdates);
            console.log('Firebase Auth profile updated');
            
            // Update or create Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
              // Document exists, update it
              await updateDoc(userDocRef, profileUpdates);
              console.log('Firestore document updated');
            } else {
              // Document doesn't exist, create it
              const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || `User-${user.uid.substring(0,5)}`,
                photoURL: user.photoURL || '',
                ...profileUpdates
              };
              await setDoc(userDocRef, newProfile);
              console.log('Firestore document created');
            }
            
            // Manually update the local state to trigger re-render
            setUserProfile(prev => {
              const updated = {...prev!, ...profileUpdates};
              console.log('Local state updated:', updated);
              return updated;
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    } else {
      console.log('No profile updates needed');
    }

    return Promise.resolve();
  }, [user, userProfile]);

  const addHabit = useCallback(async (habit: Omit<Habit, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'habits'), dataToFirestore(habit));
  }, [user]);

  const updateHabit = useCallback(async (updatedHabit: Habit) => {
    if (!user) return;
    const { id, ...data } = updatedHabit;
    if (!id) return;
    await updateDoc(doc(db, 'users', user.uid, 'habits', id), dataToFirestore(data));
  }, [user]);

  const deleteHabit = useCallback(async (habitId: string) => {
     if(!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'habits', habitId));
  }, [user]);

  const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'tasks'), dataToFirestore(task));
}, [user]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    if (!user) return;
    const { id, ...data } = updatedTask;
    if (!id) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', id), dataToFirestore(data));
  }, [user]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
  }, [user]);

  const addEvent = useCallback(async (event: Omit<AppEvent, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'events'), dataToFirestore(event));
  }, [user]);

  const updateEvent = useCallback(async (updatedEvent: AppEvent) => {
    if (!user) return;
    const { id, ...data } = updatedEvent;
    if (!id) return;
    await updateDoc(doc(db, 'users', user.uid, 'events', id), dataToFirestore(data));
  }, [user]);

  const deleteEvent = useCallback(async (eventId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'events', eventId));
  }, [user]);

  const completeEvent = useCallback(async (eventId: string) => {
    if (!user) return;
    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;
    
    const updatedEvent = { ...eventToUpdate, completed: !eventToUpdate.completed };
    await updateDoc(doc(db, 'users', user.uid, 'events', eventId), dataToFirestore(updatedEvent));
  }, [user, events]);
  
  const addBreak = useCallback(async (newBreak: Omit<Break, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'breaks'), dataToFirestore(newBreak));
  }, [user]);

  const updateBreak = useCallback(async (updatedBreak: Break) => {
      if (!user) return;
      const { id, ...data } = updatedBreak;
      if (!id) return;
      await updateDoc(doc(db, 'users', user.uid, 'breaks', id), dataToFirestore(data));
  }, [user]);

  const deleteBreak = useCallback(async (breakId: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'breaks', breakId));
  }, [user]);


  const toggleCompletion = useCallback(async (itemId: string, date: Date) => {
    if (!user) return;
    const completionId = `${itemId}-${format(date, 'yyyy-MM-dd')}`;
    const completionRef = doc(db, 'users', user.uid, 'completions', completionId);
    const docSnap = await getDoc(completionRef);

    if (docSnap.exists()) {
      await deleteDoc(completionRef);
    } else {
      await setDoc(completionRef, {
        itemId: itemId,
        date: Timestamp.fromDate(date),
        completed: true,
      });
    }
  }, [user]);

  const updateScheduledItemTime = useCallback(async (item: ScheduledItem, date: Date, time: string | null, endTime?: string | null) => {
    if (!user) return;
    
    let collectionName: 'habits' | 'tasks' | 'events' | '' = '';
    let updateData: any = {};
    let itemRef;
    
    switch (item.type) {
        case 'event':
            collectionName = 'events';
            updateData = { 
              time: time || '', 
              endTime: endTime || null 
            };
            itemRef = doc(db, 'users', user.uid, collectionName, item.originalId);
            await updateDoc(itemRef, updateData);
            break;
        case 'task':
            collectionName = 'tasks';
            updateData = { 
              time: time || null,
              endTime: endTime || null 
            };
            itemRef = doc(db, 'users', user.uid, collectionName, item.originalId);
            await updateDoc(itemRef, updateData);
            break;
        case 'habit':
            collectionName = 'habits';
            itemRef = doc(db, 'users', user.uid, collectionName, item.originalId);
            const habitDoc = await getDoc(itemRef);
            if(habitDoc.exists()){
                const habitData = habitDoc.data();
                const scheduleTime = habitData.schedule_time || {};
                const dateStr = format(date, 'yyyy-MM-dd');
                
                if (time) {
                    // For updateScheduledItemTime, we REPLACE the time, not add to it
                    scheduleTime[dateStr] = time;
                } else {
                    // Remove the time slot
                    delete scheduleTime[dateStr];
                }
                
                updateData = { schedule_time: scheduleTime };
                await updateDoc(itemRef, updateData);
            }
            break;
    }
  }, [user]);

  const duplicateScheduledItem = useCallback(async (item: ScheduledItem, date: Date, time: string, endTime?: string) => {
    if (!user) return;
    
    try {
      switch (item.type) {
        case 'event':
            // For events, we need to get the original event data
            const originalEventRef = doc(db, 'users', user.uid, 'events', item.originalId);
            const originalEventDoc = await getDoc(originalEventRef);
            
            if (originalEventDoc.exists()) {
                const originalEventData = originalEventDoc.data();
                const newEventData = {
                    ...originalEventData,
                    time: time,
                    endTime: endTime || null,
                    completed: false
                };
                await addDoc(collection(db, 'users', user.uid, 'events'), dataToFirestore(newEventData));
            }
            break;
        case 'task':
            // For tasks, we need to get the original task data
            const originalTaskRef = doc(db, 'users', user.uid, 'tasks', item.originalId);
            const originalTaskDoc = await getDoc(originalTaskRef);
            
            if (originalTaskDoc.exists()) {
                const originalTaskData = originalTaskDoc.data();
                const newTaskData = {
                    ...originalTaskData,
                    time: time,
                    endTime: endTime || null,
                    completed: false
                };
                await addDoc(collection(db, 'users', user.uid, 'tasks'), dataToFirestore(newTaskData));
            }
            break;
        case 'habit':
            // For habits, add the new time to the existing habit's schedule_time
            const habitRef = doc(db, 'users', user.uid, 'habits', item.originalId);
            const habitDoc = await getDoc(habitRef);
            
            if (habitDoc.exists()) {
                const habitData = habitDoc.data();
                const scheduleTime = habitData.schedule_time || {};
                const dateStr = format(date, 'yyyy-MM-dd');
                
                // Always convert to array format for consistency
                if (scheduleTime[dateStr]) {
                    const existingTime = scheduleTime[dateStr];
                    
                    let timesArray: string[];
                    if (Array.isArray(existingTime)) {
                        timesArray = [...existingTime]; // Create a copy
                    } else {
                        timesArray = [existingTime];
                    }
                    
                    // Add new time if not already present
                    if (!timesArray.includes(time)) {
                        timesArray.push(time);
                        scheduleTime[dateStr] = timesArray;
                    }
                } else {
                    // First time for this date - store as array for consistency
                    scheduleTime[dateStr] = [time];
                }
                
                await updateDoc(habitRef, { schedule_time: scheduleTime });
            }
            break;
    }
    } catch (error) {
      console.error('Error duplicating item:', error);
      throw error;
    }
  }, [user]);

  const authValue = useMemo(() => ({ 
    user, 
    userProfile, 
    loading, 
    error: persistentAuth.error,
    logout, 
    login: persistentAuth.login,
    signup: persistentAuth.signup,
    updateUserProfile 
  }), [user, userProfile, loading, persistentAuth.error, persistentAuth.login, persistentAuth.signup, logout, updateUserProfile]);

  const appDataValue: AppDataContextType = useMemo(() => ({
    habits,
    tasks,
    events,
    breaks,
    completions,
    toggleCompletion,
    addHabit,
    updateHabit,
    deleteHabit,
    addTask,
    updateTask,
    deleteTask,
    addEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    addBreak,
    updateBreak,
    deleteBreak,
    updateScheduledItemTime,
    duplicateScheduledItem,
  }), [
    habits, tasks, events, breaks, completions, 
    toggleCompletion, addHabit, updateHabit, deleteHabit, 
    addTask, updateTask, deleteTask, addEvent, updateEvent, 
    deleteEvent, completeEvent, addBreak, updateBreak, deleteBreak, updateScheduledItemTime, duplicateScheduledItem
  ]);


  return (
    <AuthContext.Provider value={authValue}>
      <AppDataContext.Provider value={appDataValue}>
        {children}
      </AppDataContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
