# CPF/CNPJ Test Generator

Extensão para Chrome que gera CPF e CNPJ sintéticos automaticamente em ambientes de desenvolvimento e testes.

Ideal para acelerar preenchimento de formulários durante QA, homologação e desenvolvimento sem precisar usar dados reais.

---

## ✨ Funcionalidades

- ✅ Geração automática de CPF e CNPJ válidos
- ✅ Ativação por site específico
- ✅ Configuração manual de domínios permitidos
- ✅ Ícone dinâmico indicando status ativo/inativo
- ✅ Permissões por domínio (host permissions)
- ✅ Compatível com Manifest V3
- ✅ Interface simples e leve

---

## 📸 Preview

| Desabilitado | Habilitado |
|---|---|
| ![](./icons/icon128.png) | ![](./icons/icon128-enabled.png) |

---

## 🚀 Como instalar no Chrome

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/cpf-cnpj-test-generator.git
```

ou baixe o ZIP do projeto.

---

### 2. Abra o Chrome

Acesse:

```text
chrome://extensions
```

---

### 3. Ative o modo desenvolvedor

No canto superior direito:

✅ **Modo do desenvolvedor**

---

### 4. Carregue a extensão

Clique em:

```text
Carregar sem compactação
```

Selecione a pasta do projeto.

---

## ⚙️ Como usar

### Habilitar no site atual

1. Abra qualquer sistema web
2. Clique no ícone da extensão
3. Clique em:

```text
Habilitar neste site
```

A extensão passará a funcionar automaticamente naquele domínio.

---

### Adicionar manualmente

Você também pode cadastrar padrões manualmente:

```text
https://google.com.br/*
https://*.empresa.com.br/*
```

---

## 🧠 Como funciona

A extensão registra dinamicamente um `content script` apenas nos sites configurados pelo usuário.

Ela utiliza:

- `chrome.scripting.registerContentScripts`
- `chrome.storage.sync`
- `chrome.permissions`
- `chrome.tabs`
- `Manifest V3`

---

## 📂 Estrutura do projeto

```text
.
├── background.js
├── popup.html
├── popup.js
├── manifest.json
└── icons/
```

---

## 🔐 Permissões utilizadas

| Permissão | Motivo |
|---|---|
| `storage` | Salvar sites habilitados |
| `scripting` | Injetar scripts dinamicamente |
| `tabs` | Detectar aba atual |
| `activeTab` | Interagir com o site aberto |

---

## 🎯 Exemplos de uso

- Sistemas ERP
- Plataformas de cadastro
- Ambientes de homologação
- Testes automatizados
- QA manual
- Desenvolvimento frontend/backend

---

## 🛠 Tecnologias

- JavaScript Vanilla
- Chrome Extensions API
- Manifest V3

---

## 📦 Manifest

A extensão utiliza Manifest V3.

---

## 🧩 Interface Popup

A interface permite:

- habilitar o site atual
- adicionar domínios manualmente
- remover permissões
- visualizar status da extensão

---

## ⚡ Background Worker

O `background.js` gerencia:

- sincronização dos content scripts
- troca dinâmica dos ícones
- atualização automática por aba
- validação dos domínios habilitados

---

## 👨‍💻 Autor

Desenvolvido por Germano Fortuna 🚀
