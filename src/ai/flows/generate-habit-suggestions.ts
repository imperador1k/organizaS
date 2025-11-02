'use server';

/**
 * @fileOverview An AI agent for generating personalized habit suggestions.
 *
 * - generateHabitSuggestions - A function that generates habit suggestions based on user goals.
 * - GenerateHabitSuggestionsInput - The input type for the generateHabitSuggestions function.
 * - GenerateHabitSuggestionsOutput - The return type for the generateHabitSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateHabitSuggestionsInputSchema = z.object({
  goal: z.string().describe('The user goal, e.g., improve fitness, learn a new skill.'),
});
export type GenerateHabitSuggestionsInput = z.infer<typeof GenerateHabitSuggestionsInputSchema>;

const GenerateHabitSuggestionsOutputSchema = z.object({
  habitName: z.string().describe('A concise and clear name for the suggested habit.'),
  icon: z.string().describe('A relevant icon name from the lucide-react library (e.g., "Book", "Dumbbell").'),
});
export type GenerateHabitSuggestionsOutput = z.infer<typeof GenerateHabitSuggestionsOutputSchema>;

export async function generateHabitSuggestions(
  input: GenerateHabitSuggestionsInput
): Promise<GenerateHabitSuggestionsOutput> {
  return generateHabitSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHabitSuggestionsPrompt',
  input: { schema: GenerateHabitSuggestionsInputSchema },
  output: { schema: GenerateHabitSuggestionsOutputSchema },
  prompt: `You are an AI assistant that suggests a single, actionable habit to help a user achieve their goal.
  The user's goal is: {{{goal}}}

  Suggest a specific habit related to this goal.
  Provide a relevant icon name from the lucide-react library.
  For example, if the goal is 'read more', a good habit name is 'Read a Chapter' and a good icon is 'BookOpen'.
  If the goal is 'get fit', a good habit name is 'Morning Run' and a good icon is 'Footprints'.

  Return a single JSON object with 'habitName' and 'icon' fields.
  `,
});

const generateHabitSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateHabitSuggestionsFlow',
    inputSchema: GenerateHabitSuggestionsInputSchema,
    outputSchema: GenerateHabitSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
