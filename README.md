# Laudomatch — Landing Page

Site de apresentação do **Laudomatch**, plataforma que conecta profissionais de saúde a oportunidades de emissão de laudos médicos a distância.

## Sobre o projeto

O Laudomatch resolve um gargalo crítico na saúde: clínicas e hospitais com demanda de laudos e médicos especializados disponíveis para emiti-los remotamente. A landing page captura leads e direciona para o onboarding da plataforma.

## Estrutura

```
├── index.html        # Página principal (captação de leads)
├── obrigado.html     # Confirmação pós-cadastro
├── privacy.html      # Política de privacidade
├── terms.html        # Termos de uso
└── api/              # Funções serverless (processamento de formulários)
```

## Tecnologia

- HTML, CSS e JavaScript puros (sem framework)
- Funções serverless via Vercel (pasta `api/`)
- Deploy automático via Vercel a partir da branch `main`

## Deploy

O site é hospedado na Vercel com deploy contínuo. Qualquer push para `main` atualiza o site em produção automaticamente.

## Repositório principal

O app completo do Laudomatch está em [`luizlessa-dev/laudomatch`](https://github.com/luizlessa-dev/laudomatch) (privado).
