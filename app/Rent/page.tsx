"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarrosselNew from "@/components/CarrosselNew";

interface Property {
  Codigo: string;
  Categoria: string;
  Bairro: string;
  Cidade: string;
  ValorVenda: number;
  ValorLocacao?: number;
  Dormitorios: number;
  Suites: number;
  Vagas: number;
  AreaTotal?: number;
  AreaPrivativa?: number;
  EmDestaque: string;
  Foto?: any;
  propertyDetails?: any;
  isLoadingDetails?: boolean;
}

// New LuxuryProperty interface to represent high-end properties
interface LuxuryProperty {
  id: string;
  price: number;
  address: string;
  city: string;
  zipCode: string;
  beds: number;
  fullBaths: number;
  halfBaths: number;
  sqft: number;
  image: string;
}

export default function RentPage() {
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverBackground, setHoverBackground] = useState("");
  const [showBackground, setShowBackground] = useState(false);
  const [activeNeighborhood, setActiveNeighborhood] = useState<number | null>(
    null
  );
  // New state for carousel
  const [carouselPosition, setCarouselPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  // Ref for featured properties section for scroll functionality
  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState("");

  // Array de bairros com imagens correspondentes
  const neighborhoods = [
    { name: "Vila Nova Conceição", image: "/images/vilanova2.jpg" },
    { name: "Moema", image: "/images/moema.jpg" },
    { name: "Campo Belo / Brooklin", image: "/cpbelo.jpg" },
    { name: "Itaim", image: "/images/itaim.jpg" },
    { name: "Jardins", image: "/images/jardins.jpg" },
    { name: "Vila Olímpia", image: "/images/vo.jpg" },
    { name: "Ibirapuera", image: "/images/IBirapuera.jpg" },
  ];

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await fetch("/api/newBuilding");
        if (!response.ok) {
          throw new Error("Falha ao buscar imóveis");
        }
        const data = await response.json();

        // Filtrar imóveis em destaque
        const featured = data.filter(
          (property: Property) => property.EmDestaque === "Sim"
        );

        // Adicionar flag para controlar carregamento de detalhes
        const featuredWithDetailFlags = featured.map((property: Property) => ({
          ...property,
          isLoadingDetails: true,
          propertyDetails: null,
        }));

        setFeaturedProperties(featuredWithDetailFlags);
        setLoading(false);

        // Buscar detalhes para cada propriedade
        for (const property of featuredWithDetailFlags) {
          fetchPropertyDetails(property.Codigo);
        }
      } catch (error) {
        console.error("Erro ao buscar imóveis em destaque:", error);
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/property/${propertyId}`);
      if (!response.ok) {
        throw new Error(`Falha ao buscar detalhes do imóvel ${propertyId}`);
      }
      const detailsData = await response.json();

      // Atualizar a propriedade específica com os detalhes
      setFeaturedProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.Codigo === propertyId
            ? {
                ...property,
                propertyDetails: detailsData,
                isLoadingDetails: false,
              }
            : property
        )
      );
    } catch (error) {
      console.error(`Erro ao buscar detalhes do imóvel ${propertyId}:`, error);

      // Marcar como não carregando mesmo em caso de erro
      setFeaturedProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.Codigo === propertyId
            ? { ...property, isLoadingDetails: false }
            : property
        )
      );
    }
  };

  // Função para obter a imagem do imóvel
  const getPropertyImage = (property: Property) => {
    // Tenta obter a imagem dos detalhes completos primeiro
    if (property.propertyDetails && property.propertyDetails.Foto) {
      const photos = property.propertyDetails.Foto;

      // Buscar a foto destacada, se disponível
      const featuredPhoto = Object.values(photos).find(
        (photo: any) => photo && photo.Destaque === "Sim" && photo.Foto
      ) as any;

      if (featuredPhoto) {
        return featuredPhoto.Foto;
      }

      // Se não houver foto destacada, pegar a primeira disponível
      const firstPhoto = Object.values(photos).find(
        (photo: any) => photo && photo.Foto
      ) as any;

      if (firstPhoto) {
        return firstPhoto.Foto;
      }
    }

    if (!property.Foto) return "/images/bedroom.jpg";

    if (Array.isArray(property.Foto) && property.Foto.length > 0) {
      return property.Foto[0].Foto;
    }

    if (typeof property.Foto === "object") {
      const photoKeys = Object.keys(property.Foto);
      if (photoKeys.length > 0 && property.Foto[photoKeys[0]]?.Foto) {
        return property.Foto[photoKeys[0]].Foto;
      }
    }

    return "/images/bedroom.jpg";
  };

  // Formatar endereço
  const formatAddress = (property: Property) => {
    let address = "";
    if (property.Bairro) {
      address += property.Bairro;

      if (property.Cidade) {
        address += `, ${property.Cidade}`;
      }
    } else if (property.Cidade) {
      address = property.Cidade;
    } else {
      address = "Endereço não disponível";
    }

    return address;
  };

  // Formatar valor monetário no padrão brasileiro
  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return "Preço sob consulta";

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Função para lidar com o hover no cartão de bairro
  const handleNeighborhoodHover = (imagePath: string, index: number) => {
    setHoverBackground(imagePath);
    setShowBackground(true);
    setActiveNeighborhood(index);
  };

  // Função para resetar o fundo quando o mouse sair da área
  const handleNeighborhoodLeave = () => {
    setShowBackground(false);
    setActiveNeighborhood(null);
    // Mantemos a imagem atual para permitir que ela fade out suavemente
  };

  // Carousel navigation functions
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const cardWidth =
        carouselRef.current.querySelector("div")?.clientWidth || 0;
      const gap = 20; // Same as the gap defined in CSS
      const scrollAmount = cardWidth + gap;

      const newPosition =
        direction === "left"
          ? Math.max(carouselPosition - scrollAmount, 0)
          : carouselPosition + scrollAmount;

      // Calculate the maximum scroll position
      const carouselWidth = carouselRef.current.scrollWidth;
      const containerWidth = carouselRef.current.clientWidth;
      const maxScroll = carouselWidth - containerWidth;

      const finalPosition = Math.min(newPosition, maxScroll);

      carouselRef.current.scrollTo({
        left: finalPosition,
        behavior: "smooth",
      });

      setCarouselPosition(finalPosition);
    }
  };

  // Function to scroll to featured properties section
  const scrollToFeaturedProperties = () => {
    featuredSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to handle property card click
  const handlePropertyClick = (propertyCode: string) => {
    router.push(`/place/${propertyCode}`);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactStatus("Enviando...");
    try {
      const response = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: `Tópico: ${contactForm.topic}\nMensagem: ${contactForm.message}`,
          formType:
            contactForm.topic === 'aluguel' ? 'aluguel' :
            contactForm.topic === 'venda' ? 'venda' :
            'contato',
        }),
      });
      if (response.ok) {
        setContactStatus("E-mail enviado com sucesso!");
        setContactForm({ name: "", email: "", phone: "", topic: "", message: "" });
      } else {
        setContactStatus("Erro ao enviar e-mail.");
      }
    } catch (error) {
      setContactStatus("Erro ao enviar e-mail.");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <Header />

        {/* Seção Hero */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Nossos Alugueis Exclusivos</h1>
            <button
              className={styles.exploreButton}
              onClick={scrollToFeaturedProperties}
            >
              Explore Nossos Imóveis <span className={styles.arrowIcon}>↓</span>
            </button>
          </div>
        </div>

        {/* Seção de Regiões */}
        <div className={styles.regionsSection}>
          {/* Imagem de fundo que muda com o hover */}
          <div
            className={`${styles.regionsBgImage} ${
              !showBackground ? styles.hiddenBackground : ""
            }`}
            style={{
              backgroundImage: hoverBackground
                ? `url(${hoverBackground})`
                : "none",
            }}
          ></div>

          <div className={styles.regionsSectionContent}>
            <div className={styles.regionsLeftColumn}>
              <div className={styles.regionsHeader}>
                <h2 className={styles.regionsTitle}>Nossas Regiões</h2>
                <p className={styles.regionsSubtitle}>
                  Descubra os imóveis que você estava esperando.
                </p>
              </div>

              <div className={styles.regionsList}>
                {neighborhoods.map((neighborhood, index) => (
                  <div
                    key={index}
                    className={`${styles.regionCard} ${
                      activeNeighborhood === index ? styles.activeCard : ""
                    }`}
                    onMouseEnter={() =>
                      handleNeighborhoodHover(neighborhood.image, index)
                    }
                    onMouseLeave={handleNeighborhoodLeave}
                  >
                    <h3>{neighborhood.name}</h3>
                    <span className={styles.arrowIcon}>›</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Imóveis em Destaque */}
        <div
          ref={featuredSectionRef}
          className={styles.featuredPropertiesSection}
        >
          <div className={styles.featuredPropertiesContent}>
            <div className={styles.featuredPropertiesHeader}>
              <h2 className={styles.featuredPropertiesTitle}>
                Imóveis em Destaque
              </h2>
              {/* <button className={styles.filtersButton}>
                Filtros <span className={styles.filterIcon}>⇄</span>
              </button> */}
            </div>

            {loading ? (
              <div className={styles.loadingContainer}>
                <p>Carregando imóveis...</p>
              </div>
            ) : (
              <div className={styles.propertiesGrid}>
                {featuredProperties.slice(0, 6).map((property) => (
                  <div
                    key={property.Codigo}
                    className={styles.propertyCard}
                    onClick={() => handlePropertyClick(property.Codigo)}
                  >
                    <div className={styles.propertyImageContainer}>
                      <div className={styles.forSaleTag}>PARA ALUGAR</div>
                      <img
                        src={getPropertyImage(property)}
                        alt={`Imóvel em ${property.Bairro || property.Cidade}`}
                        className={styles.propertyImage}
                      />
                    </div>
                    <div className={styles.propertyDetails}>
                      <h3 className={styles.propertyPrice}>
                        {property.ValorLocacao !== undefined &&
                        property.ValorLocacao !== null &&
                        property.ValorLocacao > 0
                          ? formatCurrency(property.ValorLocacao)
                          : property.ValorVenda !== undefined &&
                            property.ValorVenda !== null
                          ? formatCurrency(property.ValorVenda)
                          : "Preço sob consulta"}
                      </h3>
                      <p className={styles.propertyAddress}>
                        {formatAddress(property)}
                      </p>
                      <div className={styles.propertySpecs}>
                        {property.AreaPrivativa &&
                          Number(property.AreaPrivativa) > 0 && (
                            <span>
                              {property.AreaPrivativa.toLocaleString("pt-BR")}{" "}
                              M²
                            </span>
                          )}
                        {property.Dormitorios > 0 && (
                          <span>{property.Dormitorios} DORM</span>
                        )}
                        {property.Suites > 0 && (
                          <span>{property.Suites} SUÍTES</span>
                        )}
                        {!property.AreaPrivativa && property.AreaTotal && (
                          <span>
                            {property.AreaTotal.toLocaleString("pt-BR")} M²
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Seção de Contato */}
        <div className={styles.contactSection}>
          <div className={styles.contactContent}>
            <div className={styles.contactTextSection}>
              <h2 className={styles.contactTitle}>Entre em Contato</h2>
              <p className={styles.contactSubtitle}>
                Estamos prontos para ajudar você a encontrar o imóvel ideal.
              </p>
            </div>
            <div className={styles.contactFormContainer}>
              <form className={styles.contactForm} onSubmit={handleContactSubmit}>
                <div className={styles.formField}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nome *"
                    className={styles.formInput}
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    className={styles.formInput}
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefone *"
                    className={styles.formInput}
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <select
                    className={styles.formSelect}
                    name="topic"
                    value={contactForm.topic}
                    onChange={handleContactChange}
                    required
                  >
                    <option value="" disabled>
                      Selecione um Tópico
                    </option>
                    <option value="compra">Comprar imóvel</option>
                    <option value="aluguel">Alugar imóvel</option>
                    <option value="venda">Vender imóvel</option>
                    <option value="avaliacao">Avaliação de imóvel</option>
                    <option value="consultoria">Consultoria imobiliária</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <textarea
                    name="message"
                    placeholder="Sua Mensagem *"
                    className={styles.formTextarea}
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    id="consent"
                    className={styles.checkbox}
                    required
                  />
                  <label htmlFor="consent" className={styles.checkboxLabel}>
                    Ao clicar em "Enviar" abaixo, eu autorizo o contato e
                    recebimento de mensagens exclusivamente da Prime Estate de
                    acordo com a{" "}
                    <a href="#" className={styles.policyLink}>
                      Política de Privacidade
                    </a>{" "}
                    e{" "}
                    <a href="#" className={styles.policyLink}>
                      Termos de Uso
                    </a>
                    .
                  </label>
                </div>
                <button type="submit" className={styles.submitButton}>
                  Enviar
                </button>
                {contactStatus && <p style={{ marginTop: 10 }}>{contactStatus}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
