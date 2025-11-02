# 🔧 Configuração do Cloudinary no Vercel

## ⚠️ Problema Atual
O erro "Cloudinary not configured" indica que as variáveis de ambiente não estão configuradas no Vercel.

## 🚀 Solução: Configurar Variáveis no Vercel

### 1. Acesse o Dashboard do Vercel
- Vá para [vercel.com](https://vercel.com)
- Faça login na sua conta
- Selecione o projeto `organizaS`

### 2. Configure as Variáveis de Ambiente
Vá para **Settings** → **Environment Variables** e adicione:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dbr5wxlm8
NEXT_PUBLIC_CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_secret_here
```

### 3. Obtenha as Credenciais do Cloudinary
Se ainda não tem conta no Cloudinary:

1. **Crie conta gratuita**: [cloudinary.com](https://cloudinary.com)
2. **Acesse o Dashboard**: [cloudinary.com/console](https://cloudinary.com/console)
3. **Copie as credenciais**:
   - Cloud Name: `dbr5wxlm8` (já configurado)
   - API Key: (copie do dashboard)
   - API Secret: (copie do dashboard)

### 4. Redeploy o Projeto
Após configurar as variáveis:
1. Vá para **Deployments**
2. Clique em **Redeploy** no último deployment
3. Aguarde o deploy completar

## 🔍 Verificação
Após o redeploy, teste o upload de imagem:
1. Vá para **Settings**
2. Selecione uma imagem
3. Clique em **Save**

Se ainda der erro, verifique:
- ✅ Variáveis configuradas corretamente
- ✅ Redeploy realizado
- ✅ Cloudinary ativo

## 🆘 Fallback
Se o Cloudinary não funcionar, a compressão local ainda funcionará para imagens pequenas.
