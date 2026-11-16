# Preparação Android / iOS — sem publicação ou pagamentos

A campanha web e GitHub Pages funcionam sem backend, API paga, subscrição, publicidade ou serviço de terceiros em execução. As ferramentas Vite, Tiled e Capacitor são gratuitas. O build nativo é apenas preparado; APK/AAB/iOS não foram gerados neste ambiente.

## Desenvolvimento web

`npm ci`, `npm run dev`; validar com `npm test`, `npm run test:phaser`, `npm run test:v15`, `npm run test:bot`, `npm run build`.

O build em dist usa URLs relativas para GitHub Pages e para a WebView. O service worker é para HTTPS web; não é requisito de execução nativa. Não carregar o clássico no pacote nativo. Os dados WebView e Safari não são automaticamente partilhados: guardar/exportar progresso antes de trocar de plataforma.

## Android

Instalar Android Studio e SDK/JDK compatíveis com Capacitor 7. `npm run cap:android` (uma vez), `npm run cap:sync`, `npx cap open android`. No Android Studio, executar num dispositivo real, configurar orientação portrait na Activity e testar safe areas, botão voltar, suspensão e áudio. Para APK debug: Gradle assembleDebug. Para AAB de distribuição: gerar keystore de assinatura privada e usar bundleRelease; nunca guardar keystore/senhas no repositório. Nenhum keystore foi criado por esta atualização.

## iOS

É necessário macOS com Xcode compatível. `npm run cap:ios`, `npm run cap:sync`, `npx cap open ios`. Configurar Team, bundle ID e orientação portrait no target; verificar lifecycle e safe areas em iPhone real. Não foi criado projeto iOS nem feito provisionamento.

## Checklist para as lojas

- Identidade/conta do proprietário e contratos das lojas.
- Assinatura, identificador estável, versões e artefactos de produção.
- Ícones, capturas, descrição, classificação etária e contacto de suporte.
- Política de privacidade e declarações Data Safety/App Privacy corretas: atualmente, relatórios ficam locais e não há analytics remoto.
- Teste dos 25 níveis, acessibilidade, suspensão, arranque offline e migração de dados.
- Rever requisitos de target SDK, testes prévios e regras em vigor na data de submissão.
- Confirmar licenças e retirar conteúdos clássicos não necessários do pacote.
- Confirmar comportamento do botão voltar, interrupções, consumo e segurança.

## Custos que não foram contratados

Google Play informa uma inscrição única de US$25: https://support.google.com/googleplay/android-developer/answer/6112435/ . Apple Developer Program informa US$99/ano: https://developer.apple.com/help/account/membership/program-enrollment . Consultado em 16-11-2026. Hardware macOS/iPhone e eventuais impostos são custos separados. Isto não altera a gratuitidade do jogo web. Nenhuma conta foi criada, nenhum acordo foi aceite e nenhum pagamento foi realizado.

## Monetização futura (não implementada)

Ko-fi como apoio voluntário; cosméticos sem vantagens de jogo; eventuais anúncios recompensados apenas opcionais. O modo puro e os seus resultados devem permanecer sem vantagens. Integrar compras/anúncios exige nova análise de privacidade e das regras de cada loja. Não há monetização nesta versão.
