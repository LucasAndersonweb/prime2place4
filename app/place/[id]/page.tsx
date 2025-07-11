"use client";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { FaCheckCircle } from "react-icons/fa";
import MapWrapper from "@/components/MapWrapper";
import ScrollText from "@/components/Scroll";
import ShareButton from "@/components/ShareButton";
import ShowAllPhotosButton from "@/components/ShowAllPhotosButton";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./styles.module.scss";
import {
  PiBed,
  PiBathtub,
  PiCar,
  PiRuler,
  PiArrowArcRight,
  PiMoneyDuotone,
  PiCurrencyDollarSimpleDuotone,
} from "react-icons/pi";
import { SlArrowRight } from "react-icons/sl";
import DetailButtons from "@/components/DetailButtons";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { AiFillHeart } from "react-icons/ai";
import { useParams } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrar o plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface FotoType {
  Foto: string;
  [key: string]: any;
}

interface VideoType {
  Video: string;
  [key: string]: any;
}

interface BuildingDetails {
  Codigo: string;
  Categoria: string;
  Bairro: string;
  Cidade: string;
  ValorVenda: number | string;
  ValorLocacao?: number | string;
  Dormitorios: number | string;
  Suites: number | string;
  Vagas: number | string;
  AreaTotal?: number | string;
  AreaPrivativa?: number | string;
  TipoImovel?: string;
  Caracteristicas?: Record<string, string>;
  InfraEstrutura?: Record<string, string>;
  Foto?: FotoType[] | Record<string, FotoType>;
  Video?: VideoType[] | Record<string, VideoType>;
  TituloSite?: string;
  DescricaoWeb?: string;
  ValorCondominio?: number | string;
  ValorIptu?: number | string;
}

export default function Place() {
  const params = useParams();
  const id = params.id as string;
  const [building, setBuilding] = useState<BuildingDetails | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  // Estado para o formulário de agendamento de visita
  const [visitaForm, setVisitaForm] = useState({
    data: "",
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });
  const [visitaStatus, setVisitaStatus] = useState("");

  // Função para lidar com mudanças no formulário de visita
  const handleVisitaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVisitaForm({ ...visitaForm, [e.target.name]: e.target.value });
  };

  // Função para enviar o formulário de agendamento de visita
  const handleVisitaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitaStatus("Enviando...");
    try {
      const response = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: visitaForm.nome,
          email: visitaForm.email,
          phone: visitaForm.telefone,
          message: `Data da visita: ${visitaForm.data}\nMensagem: ${visitaForm.mensagem}`,
          formType: "visita",
        }),
      });
      if (response.ok) {
        setVisitaStatus("Agendamento enviado com sucesso!");
        setVisitaForm({ data: "", nome: "", email: "", telefone: "", mensagem: "" });
      } else {
        setVisitaStatus("Erro ao enviar agendamento.");
      }
    } catch (error) {
      setVisitaStatus("Erro ao enviar agendamento.");
    }
  };

  // Formatar valor monetário no padrão brasileiro
  const formatCurrency = (value: number | string) => {
    if (!value && value !== 0) return "Sob consulta";

    const numValue = typeof value === "string" ? Number(value) : value;

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  // Efeito GSAP para animação do formulário no scroll
  useEffect(() => {
    if (!formRef.current || !building) return;

    const form = formRef.current;
    const isMobile = window.innerWidth <= 768;

    // Só aplicar a animação em desktop
    if (!isMobile) {
      // Reset inicial
      gsap.set(form, { y: 0 });

      // Aguardar um frame para garantir que os elementos estão renderizados
      requestAnimationFrame(() => {
        const mapInfo = document.querySelector(
          `.${styles.mapInfo}`
        ) as HTMLElement;
        if (!mapInfo) return;

        // Calcular a distância máxima considerando margem do topo
        const formInitialTop = form.offsetTop;
        const mapInfoTop = mapInfo.offsetTop;
        const topMargin = 20; // Margem de 20px do topo da tela

        // Ajustar o cálculo para manter o formulário com margem do topo
        const maxDistance = (mapInfoTop - formInitialTop) * 0.7 - topMargin;

        // Configurar ScrollTrigger com animação direta
        const scrollTrigger = ScrollTrigger.create({
          trigger: form,
          start: "top 50%",
          endTrigger: mapInfo,
          end: "bottom center",
          scrub: 0, // Movimento mais direto e responsivo
          onUpdate: (self) => {
            // Calcular movimento com margem do topo
            const baseMovement = self.progress * maxDistance;
            const finalMovement = baseMovement + topMargin; // Adicionar margem consistente

            gsap.set(form, {
              y: finalMovement,
            });
          },
        });

        // Cleanup
        return () => {
          scrollTrigger.kill();
        };
      });
    }

    // Cleanup geral
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [building]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // Check if property is favorited
    const checkFavorite = async () => {
      if (!token) return;
      try {
        const response = await fetch("/api/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const favorites = await response.json();
          if (Array.isArray(favorites)) {
            setIsFavorite(favorites.some((fav) => fav.propertyId === id));
          }
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavorite();
  }, [id]);

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const API_KEY = "ebf5cd003e6bf2820075a809cfd9d4ad";
        const BASE_URL = "https://prime2pl-rest.vistahost.com.br";

        const pesquisa = JSON.stringify({
          fields: [
            "TituloSite",
            "Codigo",
            "Categoria",
            "DescricaoWeb",
            "Bairro",
            "Cidade",
            "ValorVenda",
            "ValorLocacao",
            "Dormitorios",
            "Suites",
            "Vagas",
            "AreaPrivativa",
            "ValorIptu",
            "AreaTotal",
            {
              Foto: ["Foto", "FotoPequena", "Destaque"],
            },
            {
              Video: ["Video", "Destaque"],
            },
            "Caracteristicas",
            "InfraEstrutura",
            "ValorCondominio",
          ],
        });

        const url = `${BASE_URL}/imoveis/detalhes?key=${API_KEY}&imovel=${id}&pesquisa=${encodeURIComponent(
          pesquisa
        )}`;

        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
          cache: "no-cache",
        });

        if (res.ok) {
          const data = await res.json();
          setBuilding(data);
        } else {
          console.error("Erro ao obter dados do imóvel:", res.statusText);
        }
      } catch (error) {
        console.error("Erro fetch imóvel:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilding();
  }, [id]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/");
      toast.error("Faça login para favoritar imóveis");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      if (!isFavorite) {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ propertyId: id }),
        });

        if (response.ok) {
          setIsFavorite(true);
          toast.success("Imóvel adicionado aos favoritos!");
        } else {
          const error = await response.json();
          toast.error(error.error || "Erro ao adicionar aos favoritos");
        }
      } else {
        // Remove from favorites
        const response = await fetch(`/api/favorites?propertyId=${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsFavorite(false);
          toast.success("Imóvel removido dos favoritos!");
        } else {
          const error = await response.json();
          toast.error(error.error || "Erro ao remover dos favoritos");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Erro ao atualizar favoritos");
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!building) {
    return (
      <div>
        <Header />
        <main style={{ padding: "2rem" }}>
          <h2>Imóvel não encontrado.</h2>
          <p>Tente novamente mais tarde.</p>
          <Link href="/search">Voltar para a busca</Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Log completo do imóvel para ver toda a estrutura
  console.log("Dados completos do imóvel:", building);

  // Logs específicos para Lazer e Infraestrutura
  console.log("=== Lazer e Infraestrutura ===");
  console.log("Dados brutos:", building.InfraEstrutura);
  if (building.InfraEstrutura) {
    Object.entries(building.InfraEstrutura).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  }

  // Logs específicos para Características
  console.log("=== Características e comodidades ===");
  console.log("Dados brutos:", building.Caracteristicas);
  if (building.Caracteristicas) {
    Object.entries(building.Caracteristicas).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  }

  // Log específico para verificar piscina
  console.log("=== Verificação de Piscina ===");
  console.log(
    "Piscina em Infraestrutura:",
    building.InfraEstrutura?.["Piscina"]
  );
  console.log(
    "Piscina em Características:",
    building.Caracteristicas?.["Piscina"]
  );
  console.log(
    "Piscina Aquecida em Infraestrutura:",
    building.InfraEstrutura?.["Piscina Aquecida"]
  );
  console.log(
    "Piscina Aquecida em Características:",
    building.Caracteristicas?.["Piscina Aquecida"]
  );

  let arrayFotos: FotoType[] = [];
  if (Array.isArray(building.Foto)) {
    arrayFotos = building.Foto;
  } else {
    arrayFotos = Object.values(building.Foto || {}) as FotoType[];
  }

  let arrayVideos: VideoType[] = [];
  if (Array.isArray(building.Video)) {
    arrayVideos = building.Video;
  } else {
    arrayVideos = Object.values(building.Video || {}) as VideoType[];
  }

  console.log("Videos disponíveis:", arrayVideos); // Log para debug

  const totalFotos = arrayFotos.length;
  const mainLeft = (() => {
    const fotoPrincipal = arrayFotos.find((foto) => foto.Destaque === "Sim");
    return fotoPrincipal
      ? fotoPrincipal.Foto
      : totalFotos > 0
      ? arrayFotos[0].Foto
      : "/images/placeholder.png";
  })();
  const topRow = arrayFotos.slice(1, 3); // 2 fotos
  const bottomRow = arrayFotos.slice(3, 5); // 2 fotos

  const valorVendaFormatado = Number(building.ValorVenda || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
  const quartos = building.Dormitorios || "N/D";
  const banheiros = building.Caracteristicas?.["Banheiro Social Qtd"] || "N/D";
  const area = building.AreaPrivativa || building.AreaTotal || "N/D";

  return (
    <>
      <Header />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#575f60",
          },
          success: {
            iconTheme: {
              primary: "#b78d58",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.back}>
            <Link href="/search">
              <img src="/icons/ArrowLeft.svg" alt="Voltar" />
              <span style={{ color: "#495057", marginLeft: "10px" }}>
                Voltar para a pesquisa
              </span>
            </Link>
          </div>
          <div className={styles.images}>
            <div className={styles.imageLeft}>
              <img src={mainLeft} alt="Imagem principal" />
            </div>

            <div className={styles.imagesRight}>
              <div className={styles.imagesRightRow}>
                {topRow.map((foto, i) => (
                  <img key={i} src={foto.Foto} alt={`Foto ${i}`} />
                ))}
              </div>
              <div className={styles.imagesRightRow}>
                {bottomRow.map((foto, i) => (
                  <img key={i} src={foto.Foto} alt={`Foto ${i}`} />
                ))}
              </div>
            </div>

            <div className={styles.bottomImages}>
              <div className={styles.bottomLeft}>
                <button className={styles.heartButton} onClick={toggleFavorite}>
                  <AiFillHeart
                    style={{
                      color: isFavorite ? "#FF0000" : "#575f60",
                    }}
                  />
                </button>
                <ShareButton />
              </div>
              {totalFotos > 5 && <ShowAllPhotosButton photos={arrayFotos} />}
            </div>
          </div>
          {building.Video && Object.values(building.Video)[0]?.Video && (
            <div className={styles.videoContainer}>
              <div className={styles.videoHeader}>
                <h3>Tour Virtual</h3>
                <p>Conheça cada detalhe deste imóvel</p>
              </div>
              <div className={styles.videoWrapper}>
                <iframe
                  className={styles.video}
                  src={`https://www.youtube.com/embed/${
                    Object.values(building.Video)[0].Video
                  }?autoplay=1&mute=1&loop=1&playlist=${
                    Object.values(building.Video)[0].Video
                  }`}
                  title="Tour Virtual do Imóvel"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          <div className={styles.bairro}>
            {building.Bairro && (
              <>
                <h4>{building.Bairro}</h4>
                <div className={styles.arrow}>
                  <SlArrowRight size={12} />
                </div>
              </>
            )}
            <h4>{building.Cidade || "Cidade não informada"}</h4>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.leftContent}>
              <section className={styles.propertyHeader}>
                {building.TituloSite && (
                  <h1 className={styles.title}>{building.TituloSite}</h1>
                )}

                <div className={styles.price}>
                  {building.ValorVenda && Number(building.ValorVenda) > 0 ? (
                    <h2>{formatCurrency(building.ValorVenda)}</h2>
                  ) : (
                    <h2>Sob consulta</h2>
                  )}
                  {building.Bairro && (
                    <div className={styles.additionalCosts}>
                      {building.ValorCondominio &&
                      Number(building.ValorCondominio) > 0 ? (
                        <span>
                          Condomínio {formatCurrency(building.ValorCondominio)}
                        </span>
                      ) : (
                        <span>Condomínio: Sob consulta</span>
                      )}
                      {building.ValorIptu && Number(building.ValorIptu) > 0 ? (
                        <span>IPTU {formatCurrency(building.ValorIptu)}</span>
                      ) : (
                        <span>IPTU: Sob consulta</span>
                      )}
                    </div>
                  )}
                  {building.TipoImovel && (
                    <span className={styles.propertyType}>
                      {building.TipoImovel}
                    </span>
                  )}
                </div>

                <div className={styles.specs}>
                  {Number(building.Suites) > 0 ? (
                    <>
                      <div className={styles.specItem}>
                        <PiBathtub size={20} />
                        <span>
                          {building.Suites}{" "}
                          {Number(building.Suites) === 1 ? "Suíte" : "Suítes"}
                        </span>
                      </div>
                      <span className={styles.dot}>•</span>
                    </>
                  ) : Number(building.Dormitorios) > 0 ? (
                    <>
                      <div className={styles.specItem}>
                        <PiBed size={20} />
                        <span>
                          {building.Dormitorios}{" "}
                          {Number(building.Dormitorios) === 1
                            ? "Dormitório"
                            : "Dormitórios"}
                        </span>
                      </div>
                      <span className={styles.dot}>•</span>
                    </>
                  ) : null}

                  {building.Bairro && (
                    <>
                      <div className={styles.specItem}>
                        <PiCar size={20} />
                        <span>{building.Vagas || 0} Vagas</span>
                      </div>
                      <span className={styles.dot}>•</span>
                    </>
                  )}

                  <div className={styles.specItem}>
                    <PiRuler size={20} />
                    <span>
                      {building.AreaPrivativa || building.AreaTotal || 0} m²
                    </span>
                  </div>
                </div>

                <p className={styles.description}>
                  {building.DescricaoWeb || "Descrição do Imóvel"}
                </p>
                <div className={styles.warning}>
                  <p>
                    <strong>
                      *Preços variáveis: Os valores baseados em unidades
                      específicas podem diferir dos valores exibidos. Reservamos
                      o direito de alterar preços sem aviso prévio.{" "}
                    </strong>
                  </p>
                </div>
              </section>
            </div>

            <div className={styles.rightContent}>
              <div ref={formRef} className={styles.mainRight}>
                <div className={styles.rightTop}>
                  <img src="/icons/greenUser.svg" alt="" />
                  <div className={styles.rightName}>
                    <h4>Corretor(a) Prime2place</h4>
                    <div className={styles.rightCellphone}>
                      <img src="/icons/phone.svg" alt="" />
                      <p>11 97970-2902</p>
                    </div>
                  </div>
                </div>
                <div className={styles.inputs}>
                  <form onSubmit={handleVisitaSubmit}>
                    <input 
                      type="date" 
                      name="data"
                      value={visitaForm.data}
                      onChange={handleVisitaChange}
                      placeholder="Data" 
                    />
                    <input 
                      type="text" 
                      name="nome"
                      value={visitaForm.nome}
                      onChange={handleVisitaChange}
                      placeholder="Nome" 
                      required
                    />
                    <input 
                      type="email" 
                      name="email"
                      value={visitaForm.email}
                      onChange={handleVisitaChange}
                      placeholder="Email" 
                      required
                    />
                    <input 
                      type="tel" 
                      name="telefone"
                      value={visitaForm.telefone}
                      onChange={handleVisitaChange}
                      placeholder="Telefone" 
                      required
                    />
                    <textarea 
                      name="mensagem"
                      value={visitaForm.mensagem}
                      onChange={handleVisitaChange}
                      placeholder="Mensagem..."
                    ></textarea>
                    <button type="submit">
                      Agendar Visita <img src="/icons/whiteArrow.svg" alt="" />
                    </button>
                    <label>
                      <input type="checkbox" required />
                      <span>
                        Aceito a Política e Cookies e os Termos e Condições*
                      </span>
                    </label>
                    {visitaStatus && <p style={{ marginTop: 10, color: visitaStatus.includes("sucesso") ? "green" : "red" }}>{visitaStatus}</p>}
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.main}>
            <div className={styles.mainLeft}>
              <hr />
              <div className={styles.secondInfo}>
                <h3>Lazer e Infraestrutura</h3>
                <div className={styles.gridContainer}>
                  {Object.entries(building.InfraEstrutura || {})
                    .filter(([_, val]) => val === "Sim")
                    .map(([key]) => (
                      <div key={key} className={styles.gridItem}>
                        <img
                          src="/icons/checkmark2.svg"
                          alt={key}
                          className={styles.icon}
                        />
                        <span>{key}</span>
                      </div>
                    ))}
                </div>
              </div>

              <hr />
              <div className={styles.detailContainer}>
                <div className={styles.titleContainer}>
                  <h3>Mais Detalhes</h3>
                </div>
                <DetailButtons
                  arrayFotos={arrayFotos}
                  videoId={
                    building.Video
                      ? Object.values(building.Video)[0]?.Video || null
                      : null
                  }
                  bairro={building.Bairro || ""}
                  cidade={building.Cidade || ""}
                />
              </div>
              <hr />
              {building.Bairro && (
                <>
                  <div className={styles.caraInfo}>
                    <h3>Características e comodidades da propriedade</h3>
                    <div className={styles.caraIcons}>
                      {Object.entries(building.Caracteristicas || {})
                        .filter(([key, val]) => {
                          // Lista de características específicas que devem aparecer nesta seção
                          const caracteristicasEspecificas = [
                            "Água quente",
                            "Andar Alto",
                            "Ar Central",
                            "Área Serviço",
                            "Armarios Embutidos",
                            "Banho Auxiliar",
                            "Banheiro Empregada",
                            "Churrasqueira",
                            "Copa",
                            "Cozinha",
                            "Cozinha Montada",
                            "Deck",
                            "Depend Empreg",
                            "Despensa",
                            "Estar Íntimo",
                            "Hall",
                            "Hall Privativo",
                            "Home Office",
                            "Home Theater",
                            "Lareira",
                            "Lavabo",
                            "Mobiliado",
                            "Piscina",
                            "Quintal",
                            "Reformado",
                            "Sacada",
                            "Sala Armário",
                            "Sala Jantar",
                            "Sauna Priv",
                            "Semi Mobiliado",
                            "Split",
                            "Suite Master",
                            "Terraço",
                            "Terraço Gourmet",
                            "Terraço Privativo",
                            "Terraço Envidraçado",
                            "Varanda",
                            "Vista Panorâmica",
                          ];
                          return (
                            val === "Sim" &&
                            caracteristicasEspecificas.includes(key)
                          );
                        })
                        .map(([key]) => (
                          <div className={styles.iconItem} key={key}>
                            <img
                              src="/icons/tree.svg"
                              alt={key}
                              className={styles.icon}
                            />
                            <h4>{key}</h4>
                          </div>
                        ))}
                    </div>
                  </div>
                  <hr />
                  <div className={styles.mapInfo}>
                    <h3>Explore a área</h3>
                    <div className={styles.mapContainer}>
                      <MapWrapper
                        bairro={building.Bairro || ""}
                        cidade={building.Cidade || ""}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ScrollText />
      <Footer />
    </>
  );
}
