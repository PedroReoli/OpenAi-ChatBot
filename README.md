### 🤖 OpenAI Chatbot Avançado

<div align="center">

![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.8%2B-brightgreen)
![OpenAI](https://img.shields.io/badge/OpenAI-API-orange)
![Licença](https://img.shields.io/badge/licença-MIT-green)
![Status](https://img.shields.io/badge/status-ativo-success)

</div>

<p align="center">
  <img src="https://sjc.microlink.io/z2qi5KnKNdya4FCzYEgI_ioNtySZjvv3VnZR_fS_hy5UWkLu5AE-SnjGIhgv3KH4oFi_XUrTIS7dabwEEPSE-w.jpeg" alt="OpenAI Chatbot Logo" width="150" height="150" style="border-radius: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

> Um chatbot moderno com interface futurista, sistema de treinamento personalizado e suporte ao processamento de arquivos. Desenvolvido com Python, Flask e a API da OpenAI.

---

## 📋 Índice

- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias-utilizadas)
- [🚀 Instalação](#-instalação)
- [📚 Guia de Uso](#-guia-de-uso)
- [⚙️ Configurações](#️-configurações-avançadas)
- [🔍 Solução de Problemas](#-solução-de-problemas)
- [🌟 Recursos Especiais](#-recursos-especiais)
- [🤝 Contribuindo](#-contribuindo)
- [📜 Licença](#-licença)

---

## ✨ Funcionalidades

<table>
  <tr>
    <td>💬 <b>Interface Moderna</b></td>
    <td>Experiência de chat fluida com animações e transições suaves</td>
  </tr>
  <tr>
    <td>🧠 <b>Treinamento Personalizado</b></td>
    <td>Adicione exemplos específicos para refinar as respostas da IA</td>
  </tr>
  <tr>
    <td>📄 <b>Processamento de Arquivos</b></td>
    <td>Extraia dados de PDFs, DOCs, HTML, TXT, entre outros</td>
  </tr>
  <tr>
    <td>📊 <b>Análises em Tempo Real</b></td>
    <td>Visualize métricas e desempenho dos treinamentos</td>
  </tr>
  <tr>
    <td>🔄 <b>Histórico de Conversas</b></td>
    <td>Visualize e gerencie interações anteriores</td>
  </tr>
  <tr>
    <td>⚙️ <b>Configurações Avançadas</b></td>
    <td>Ajuste parâmetros como temperatura, modelo e contexto</td>
  </tr>
</table>

---

## 🛠️ Tecnologias Utilizadas

<div align="center">

| Categoria | Tecnologias |
|:-------:|:-------:|
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white) ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white) |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
| **Documentos** | PyPDF2, python-docx, html2text |
| **Armazenamento** | Arquivos JSON |
| **Estilização** | CSS responsivo com variáveis e animações |

</div>

---

## 🚀 Instalação

### Pré-requisitos

- Python 3.8 ou superior
- Conta na OpenAI com chave de API
- Conexão com a internet

### Passos para instalação

1. **Clone o repositório:**  
   ```
   git clone https://github.com/PedroReoli/OpenAi-ChatBot.git  
   cd OpenAi-ChatBot  
   ```

2. **Instale as dependências:**  
   ```
   pip install -r requirements.txt  
   ```

3. **Configure sua chave da API:**  
   - Crie um arquivo \`.env\` na raiz do projeto  
   - Adicione a linha:
     ```
     OPENAI_API_KEY=sua-chave-aqui  
     ```

4. **Inicie o servidor:**  
   ```
   python app.py  
   ```

5. **Acesse no navegador:**  
   \`http://localhost:5000\`

---

## 📚 Guia de Uso

### 💬 Chat Principal

<details open>
<summary><b>Instruções detalhadas</b></summary>

- Acesse: \`http://localhost:5000\`  
- Defina o ID de usuário no canto inferior esquerdo  
- Envie mensagens via campo de texto  
- Use o botão **"Histórico"** para visualizar interações anteriores  
- Clique em **"Nova Conversa"** para reiniciar o contexto

</details>

### 🧠 Treinamento Avançado

<details>
<summary><b>Instruções detalhadas</b></summary>

- Acesse: \`http://localhost:5000/training.html\`  
- **Exemplos**: adicione pares de pergunta e resposta  
- **Arquivos**: envie documentos para análise de conteúdo  
- **Status**: acompanhe a evolução do treinamento  
- **Configurações**: personalize os parâmetros do modelo

</details>

### 📄 Formatos de Arquivo Suportados

<div align="center">

| Tipo | Extensões |
|:----:|:---------:|
| Documentos | .pdf, .doc, .docx |
| Texto | .txt |
| Web | .html, .htm |
| Dados | .csv, .json |

</div>

---

## ⚙️ Configurações Avançadas

<details open>
<summary><b>Opções de configuração</b></summary>

| Parâmetro | Descrição | Valores |
|:----------|:----------|:--------|
| **Modelo** | Motor de IA utilizado | GPT-3.5-Turbo (padrão), GPT-4 (premium) |
| **Temperatura** | Criatividade nas respostas | 0.0 (determinístico) a 1.0 (criativo) |
| **Tokens Máximos** | Limite de tamanho da resposta | 100-4000 |
| **Prompt do Sistema** | Instruções fixas para a IA | Texto personalizado |
| **Contexto** | Mensagens anteriores consideradas | 1-20 mensagens |

</details>

---

## 🔍 Solução de Problemas

<details>
<summary><b>Problemas comuns e soluções</b></summary>

| Problema | Solução |
|:---------|:--------|
| **API não responde** | Verifique a chave e sua conexão com a internet |
| **Erro 404** | Confirme que o servidor está ativo e os arquivos estão na pasta \`static\` |
| **Problemas com GPT-4** | Sua conta precisa ter acesso habilitado; se necessário, use GPT-3.5-Turbo |
| **Lentidão no processamento** | Reduza o tamanho dos arquivos ou ajuste os tokens máximos |
| **Erros de importação** | Verifique se todas as dependências foram instaladas corretamente |

</details>

---

## 🌟 Recursos Especiais

<div align="center">

| Recurso | Descrição |
|:--------|:----------|
| **Visual Futurista** | Interface com gradientes e efeitos modernos |
| **Aprendizado Contextual** | A IA associa exemplos ao contexto da pergunta |
| **Extração Inteligente de Dados** | Arquivos são analisados automaticamente |
| **Customização Total** | Controle completo sobre o comportamento do assistente |
| **Multiusuário** | Cada usuário mantém histórico e parâmetros únicos |

</div>

---

## 🤝 Contribuindo

<details open>
<summary><b>Como contribuir para o projeto</b></summary>

Contribuições são bem-vindas! Siga estes passos:

1. **Faça um fork do repositório**
2. **Crie uma nova branch:**  
   ```
   git checkout -b feature/minha-feature  
   ```

3. **Faça commits:**  
   ```
   git commit -m "Minha contribuição"  
   ```

4. **Envie para seu fork:**  
   ```
   git push origin feature/minha-feature  
   ```

5. **Abra um Pull Request** 🚀

</details>

### Diretrizes de contribuição

- Mantenha o código limpo e bem documentado
- Adicione testes para novas funcionalidades
- Siga o estilo de código existente
- Atualize a documentação quando necessário

---

## 📜 Licença

<div align="center">

Este projeto está licenciado sob a [Licença MIT](LICENSE).

Copyright © 2025 Pedro Reoli

</div>

---

<div align="center">

**[⬆ Voltar ao topo](#-openai-chatbot-avançado)**

</div>
