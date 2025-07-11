"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.scss";

export default function PoliticaPrivacidade() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Política de Privacidade</h1>
            <p className={styles.subtitle}>
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className={styles.sections}>
            <section className={styles.section}>
              <h2>1. Informações que Coletamos</h2>
              <p>
                A Prime2Place coleta informações que você nos fornece
                diretamente, como quando você:
              </p>
              <ul>
                <li>Cria uma conta em nosso site</li>
                <li>Entra em contato conosco através de formulários</li>
                <li>Se inscreve em nossa newsletter</li>
                <li>Navega em nosso site (dados de navegação)</li>
                <li>Utiliza nossos serviços de avaliação de imóveis</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>2. Como Utilizamos suas Informações</h2>
              <p>Utilizamos as informações coletadas para:</p>
              <ul>
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar transações e pagamentos</li>
                <li>Enviar comunicações importantes e atualizações</li>
                <li>Personalizar sua experiência em nossa plataforma</li>
                <li>Cumprir obrigações legais e regulamentares</li>
                <li>Realizar análises para melhorar nossos serviços</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. Compartilhamento de Informações</h2>
              <p>
                Não vendemos, alugamos ou compartilhamos suas informações
                pessoais com terceiros, exceto nas seguintes situações:
              </p>
              <ul>
                <li>Com seu consentimento explícito</li>
                <li>Para cumprir obrigações legais</li>
                <li>Para proteger nossos direitos e propriedade</li>
                <li>
                  Com prestadores de serviços que nos auxiliam na operação da
                  plataforma
                </li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>4. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais
                apropriadas para proteger suas informações pessoais contra
                acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. Cookies e Tecnologias Similares</h2>
              <p>Utilizamos cookies e tecnologias similares para:</p>
              <ul>
                <li>Melhorar a funcionalidade do site</li>
                <li>Analisar o tráfego e uso do site</li>
                <li>Personalizar conteúdo e anúncios</li>
                <li>Lembrar suas preferências</li>
              </ul>
              <p>
                Você pode gerenciar suas preferências de cookies através das
                configurações do seu navegador.
              </p>
            </section>

            <section className={styles.section}>
              <h2>6. Seus Direitos</h2>
              <p>
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem
                direito a:
              </p>
              <ul>
                <li>Confirmação da existência de tratamento de dados</li>
                <li>Acesso aos seus dados pessoais</li>
                <li>
                  Correção de dados incompletos, inexatos ou desatualizados
                </li>
                <li>Anonimização, bloqueio ou eliminação de dados</li>
                <li>Portabilidade dos dados</li>
                <li>Eliminação dos dados tratados com consentimento</li>
                <li>Revogação do consentimento</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>7. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pessoais apenas pelo tempo necessário
                para cumprir as finalidades descritas nesta política, exceto
                quando um período de retenção mais longo for exigido ou
                permitido por lei.
              </p>
            </section>

            <section className={styles.section}>
              <h2>8. Transferência Internacional</h2>
              <p>
                Suas informações podem ser transferidas e mantidas em
                computadores localizados fora do seu estado, província, país ou
                jurisdição governamental onde as leis de proteção de dados podem
                diferir.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. Menores de Idade</h2>
              <p>
                Nossos serviços não se destinam a menores de 18 anos. Não
                coletamos intencionalmente informações pessoais de menores de 18
                anos.
              </p>
            </section>

            <section className={styles.section}>
              <h2>10. Alterações nesta Política</h2>
              <p>
                Podemos atualizar nossa Política de Privacidade periodicamente.
                Notificaremos você sobre quaisquer mudanças publicando a nova
                Política de Privacidade nesta página e atualizando a data de
                "última atualização".
              </p>
            </section>

            <section className={styles.section}>
              <h2>11. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade ou
                quiser exercer seus direitos de proteção de dados, entre em
                contato conosco:
              </p>
              <div className={styles.contact}>
                <p>
                  <strong>E-mail:</strong> info@prime2place.com.br
                </p>

                <p>
                  <strong>Endereço:</strong> R. Afonso Braz, 686 | Vila Nova
                  Conceição - SP
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
