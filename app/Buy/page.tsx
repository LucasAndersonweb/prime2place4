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

export default function BuyPage() {
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

  // Luxury properties data
  const luxuryProperties: LuxuryProperty[] = [
    {
      id: "1",
      price: 29000000,
      address: "601 WASHINGTON Street PHE",
      city: "New York City",
      zipCode: "NY 10014",
      beds: 6,
      fullBaths: 6,
      halfBaths: 2,
      sqft: 7475,
      image: "/images/cobertura.jpg",
    },
    {
      id: "2",
      price: 34995000,
      address: "200 AMSTERDAM Avenue PH2",
      city: "New York City",
      zipCode: "NY 10024",
      beds: 4,
      fullBaths: 4,
      halfBaths: 2,
      sqft: 6347,
      image: "/images/bedroom.jpg",
    },
    {
      id: "3",
      price: 28000000,
      address: "111 West 24th Street",
      city: "New York City",
      zipCode: "NY 10011",
      beds: 5,
      fullBaths: 5,
      halfBaths: 1,
      sqft: 6578,
      image: "/images/casacondominio.jpg",
    },
    {
      id: "4",
      price: 32500000,
      address: "432 Park Avenue",
      city: "New York City",
      zipCode: "NY 10022",
      beds: 5,
      fullBaths: 6,
      halfBaths: 1,
      sqft: 8255,
      image: "/images/exclusividadeprime.jpg",
    },
    {
      id: "5",
      price: 27300000,
      address: "15 Central Park West",
      city: "New York City",
      zipCode: "NY 10023",
      beds: 4,
      fullBaths: 5,
      halfBaths: 1,
      sqft: 5843,
      image: "/images/slider2.jpg",
    },
  ];

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
        console.log("Dados da API:", data);

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

  return (
    <>
      <div className={styles.container}>
        <Header />

        {/* Seção Hero */}
        <div
          className={styles.heroSection}
          style={{
            backgroundImage: 'url("/Buy.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Seu novo endereço, está aqui! </h1>
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
                <h2 className={styles.regionsTitle}>
                  Bairros com personalidade
                </h2>
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
                      <div className={styles.forSaleTag}>À VENDA</div>
                      <img
                        src={getPropertyImage(property)}
                        alt={`Imóvel em ${property.Bairro || property.Cidade}`}
                        className={styles.propertyImage}
                      />
                    </div>
                    <div className={styles.propertyDetails}>
                      <h3 className={styles.propertyPrice}>
                        {property.ValorVenda !== undefined &&
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

        <CarrosselNew />
      </div>
      <Footer />
    </>
  );
}
