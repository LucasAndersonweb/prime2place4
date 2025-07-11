"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./styles.module.scss";

export default function Presell() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bestTime: "",
    agent: "",
    address: "",
    timeFrame: "",
    message: "",
    consent: false,
  });
  const [status, setStatus] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Enviando...");
    try {
      const response = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          message: `Melhor horário: ${formData.bestTime}\nAgente: ${formData.agent}\nEndereço: ${formData.address}\nPrazo: ${formData.timeFrame}\nMensagem: ${formData.message}`,
          formType: "lancamento",
        }),
      });
      if (response.ok) {
        setStatus("E-mail enviado com sucesso!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          bestTime: "",
          agent: "",
          address: "",
          timeFrame: "",
          message: "",
          consent: false,
        });
      } else {
        setStatus("Erro ao enviar e-mail.");
      }
    } catch (error) {
      setStatus("Erro ao enviar e-mail.");
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      {/* Banner Section */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1>Luxo de verdade não se explica. Se vive.</h1>
        </div>
      </div>

      {/* Services Section with Background */}
      <div className={styles.servicesSection}>
        <div className={styles.content}>
          {/* Intro Text */}
          <div className={styles.intro}>
            <p>
              No mercado de alto padrão, cada imóvel possui uma história única e
              pode ser exatamente o que alguém está procurando. Na Prime2place,
              nossa abordagem é estratégica e personalizada, permitindo que
              identifiquemos quem realmente valoriza cada detalhe do seu
              patrimônio. Se você deseja vender ou alugar seu imóvel, estamos
              prontos para conduzir esse processo de forma eficaz.
            </p>
          </div>

          {/* Quote */}
          <div className={styles.quote}>
            Cadastre o seu imóvel e descubra como podemos transformar a
            percepção do seu patrimônio
          </div>

          {/* Services Cards */}
          <div className={styles.services}>
            <div className={styles.serviceCard}>
              <h3>Negociações Discretas Resultados Extraordinários</h3>
              <p>
                Confie a venda do seu imóvel a quem entende de excelência e
                discrição. Na Prime2place, cada etapa do processo é conduzida
                com estratégia personalizada, seleção criteriosa de compradores
                e total sigilo, garantindo o melhor resultado com a máxima
                eficiência.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3>Marketing Estratégico</h3>
              <p>
                Na Prime2place, cada ação de marketing é pensada de forma
                estratégica, com foco na valorização máxima do seu imóvel.
                Unimos inteligência de mercado, segmentação precisa e presença
                digital seletiva para atrair compradores realmente qualificados,
                garantindo negociações discretas e resultados superiores.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3>Atendimento Ultra Exclusivo</h3>
              <p>
                Mais do que vender imóveis, entregamos experiências únicas.
                Nosso atendimento ultra exclusivo une expertise, sigilo e
                excelência para transformar a venda do seu patrimônio em um
                sucesso absoluto.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Connect with Expert Section */}
        <div className={styles.connectSection}>
          <h2>
            Conecte-se com um <span>especialista</span>
          </h2>
          <p>
            Encontraremos um agente que entenda as nuances do seu{" "}
            <span>bairro</span> e as condições do mercado local
          </p>

          {/* Contact Form */}
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Nome</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Sobrenome</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Telefone (Opcional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Melhor Horário para Contato (Opcional)</label>
                <select
                  name="bestTime"
                  value={formData.bestTime}
                  onChange={handleInputChange}
                >
                  <option value=""></option>
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="evening">Noite</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Endereço (Opcional)</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Rua Exemplo, 123"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Mensagem</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                ></textarea>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent as boolean}
                  onChange={handleInputChange}
                />
                <label htmlFor="consent">
                  Ao enviar suas informações, você concorda em receber conteúdo
                  promocional/marketing por e-mail, SMS e/ou telefone. Tarifas
                  de mensagem e dados podem ser aplicadas. Você pode cancelar a
                  qualquer momento conforme nossa{" "}
                  <a href="#" className={styles.privacyLink}>
                    Política de Privacidade
                  </a>
                  .
                </label>
              </div>
            </div>

            <div className={styles.formRow}>
              <button type="submit" className={styles.submitButton}>
                Vamos nos Conectar <span className={styles.arrow}>→</span>
              </button>
            </div>
          </form>
          {status && <p style={{ marginTop: 10 }}>{status}</p>}
        </div>
      </div>

      <Footer />
    </div>
  );
}
