"use client";
import { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AiFillHeart } from "react-icons/ai";

interface FavoriteProperty {
  id: number;
  propertyId: string;
  createdAt: string;
  propertyData?: any;
}

export default function MinhaContaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    newPassword: "",
  });
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(user);
    setUserData({
      ...userData,
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phoneNumber: parsedUser.phoneNumber || "",
      password: "",
      newPassword: "",
    });

    const token = localStorage.getItem("token");

    if (token) {
      const fetchFavorites = async () => {
        setIsLoadingFavorites(true);
        try {
          const response = await fetch("/api/favorites", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const favoritesData = await response.json();

            // Fetch property details for each favorite
            const favoritesWithDetails = await Promise.all(
              favoritesData.map(async (fav: FavoriteProperty) => {
                const API_KEY = "ebf5cd003e6bf2820075a809cfd9d4ad";
                const BASE_URL = "https://prime2pl-rest.vistahost.com.br";

                const pesquisa = JSON.stringify({
                  fields: [
                    "Codigo",
                    "TituloSite",
                    "Bairro",
                    "Cidade",
                    "ValorVenda",
                    "Dormitorios",
                    "Suites",
                    "Vagas",
                    "AreaPrivativa",
                    { Foto: ["Foto", "FotoPequena", "Destaque"] },
                  ],
                });

                const url = `${BASE_URL}/imoveis/detalhes?key=${API_KEY}&imovel=${
                  fav.propertyId
                }&pesquisa=${encodeURIComponent(pesquisa)}`;

                try {
                  const res = await fetch(url, {
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                  });
                  if (res.ok) {
                    const propertyData = await res.json();
                    console.log("Dados do imóvel:", propertyData);
                    console.log("Fotos do imóvel:", propertyData.Foto);
                    return { ...fav, propertyData };
                  } else {
                    console.error("Error response from Vista API:", {
                      status: res.status,
                      statusText: res.statusText,
                    });
                    // Retorna o favorito sem os dados do imóvel em caso de erro
                    return {
                      ...fav,
                      propertyData: {
                        TituloSite: "Imóvel não encontrado",
                        Bairro: "N/A",
                        Cidade: "N/A",
                        ValorVenda: "0",
                        Dormitorios: "0",
                        Suites: "0",
                        Vagas: "0",
                        AreaPrivativa: "0",
                      },
                    };
                  }
                } catch (error) {
                  console.error("Error fetching property details:", error);
                  // Retorna o favorito sem os dados do imóvel em caso de erro
                  return {
                    ...fav,
                    propertyData: {
                      TituloSite: "Erro ao carregar imóvel",
                      Bairro: "N/A",
                      Cidade: "N/A",
                      ValorVenda: "0",
                      Dormitorios: "0",
                      Suites: "0",
                      Vagas: "0",
                      AreaPrivativa: "0",
                    },
                  };
                }
              })
            );

            setFavorites(favoritesWithDetails);
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
          toast.error("Erro ao carregar favoritos");
        } finally {
          setIsLoadingFavorites(false);
        }
      };

      fetchFavorites();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          password: userData.password,
          newPassword: userData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar dados");
      }

      // Atualiza os dados no localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          name: userData.name,
          phoneNumber: userData.phoneNumber,
        })
      );

      toast.success("Dados atualizados com sucesso!");
      setIsEditing(false);
      setUserData((prev) => ({
        ...prev,
        password: "",
        newPassword: "",
      }));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Restaura os dados originais ao cancelar
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData((prev) => ({
        ...prev,
        name: parsedUser.name || "",
        phoneNumber: parsedUser.phoneNumber || "",
        password: "",
        newPassword: "",
      }));
    }
    setIsEditing(false);
  };

  const removeFavorite = async (propertyId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.propertyId !== propertyId));
        toast.success("Imóvel removido dos favoritos!");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Erro ao remover dos favoritos");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <Toaster position="top-right" />
        <div className={styles.content}>
          <div className={styles.accountInfo}>
            <h1>Minha Conta</h1>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className={styles.disabledInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Telefone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Senha Atual</label>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nova Senha</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Digite a nova senha (opcional)"
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className={styles.loadingSpinner}>
                        <div className={styles.spinner}></div>
                      </div>
                    ) : (
                      "Salvar"
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className={styles.formGroup}>
                  <label>Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className={styles.disabledInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Telefone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    disabled
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={handleEditClick}
                  >
                    Editar Dados
                  </button>
                  <button
                    type="button"
                    className={styles.logoutButton}
                    onClick={handleLogout}
                  >
                    Sair da Conta
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2>Meus Favoritos</h2>
            {isLoadingFavorites ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
              </div>
            ) : favorites.length === 0 ? (
              <p>Você ainda não tem imóveis favoritos.</p>
            ) : (
              <div className={styles.favoritesGrid}>
                {favorites.map((favorite) => (
                  <div key={favorite.id} className={styles.favoriteCard}>
                    {favorite.propertyData && (
                      <>
                        <div className={styles.imageContainer}>
                          {(() => {
                            console.log(
                              "Renderizando imagem:",
                              favorite.propertyData.Foto
                            );
                            return null;
                          })()}
                          <img
                            src={(() => {
                              const fotos = favorite.propertyData.Foto;
                              console.log("Fotos disponíveis:", fotos);

                              interface FotoType {
                                Foto: string;
                                Destaque?: string;
                              }

                              if (Array.isArray(fotos)) {
                                console.log("É array de fotos");
                                const fotoPrincipal = fotos.find(
                                  (foto: FotoType) => {
                                    console.log("Verificando foto:", foto);
                                    return foto.Destaque === "Sim";
                                  }
                                );
                                console.log(
                                  "Foto principal encontrada:",
                                  fotoPrincipal
                                );
                                return (
                                  fotoPrincipal?.Foto ||
                                  (fotos.length > 0
                                    ? fotos[0].Foto
                                    : "/images/placeholder.png")
                                );
                              } else if (
                                typeof fotos === "object" &&
                                fotos !== null
                              ) {
                                console.log("É objeto de fotos:", fotos);
                                const fotosArray = Object.values(
                                  fotos
                                ) as FotoType[];
                                const fotoPrincipal = fotosArray.find(
                                  (foto) => foto.Destaque === "Sim"
                                );
                                return (
                                  fotoPrincipal?.Foto ||
                                  (fotosArray.length > 0
                                    ? fotosArray[0].Foto
                                    : "/images/placeholder.png")
                                );
                              }
                              return "/images/placeholder.png";
                            })()}
                            alt={favorite.propertyData.TituloSite}
                            onError={(e) => {
                              console.log("Erro ao carregar imagem");
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/placeholder.png";
                            }}
                          />
                          <button
                            onClick={() => removeFavorite(favorite.propertyId)}
                            className={styles.removeButton}
                          >
                            <AiFillHeart color="#FF0000" size={24} />
                          </button>
                        </div>
                        <div className={styles.propertyInfo}>
                          <h3>{favorite.propertyData.TituloSite}</h3>
                          <p className={styles.location}>
                            {favorite.propertyData.Bairro},{" "}
                            {favorite.propertyData.Cidade}
                          </p>
                          <p className={styles.price}>
                            {Number(
                              favorite.propertyData.ValorVenda
                            ).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                          <div className={styles.details}>
                            {Number(favorite.propertyData.Suites) > 0 ? (
                              <span>
                                {favorite.propertyData.Suites}{" "}
                                {Number(favorite.propertyData.Suites) === 1
                                  ? "Suíte"
                                  : "Suítes"}
                              </span>
                            ) : Number(favorite.propertyData.Dormitorios) >
                              0 ? (
                              <span>
                                {favorite.propertyData.Dormitorios}{" "}
                                {Number(favorite.propertyData.Dormitorios) === 1
                                  ? "Dormitório"
                                  : "Dormitórios"}
                              </span>
                            ) : null}
                            {Number(favorite.propertyData.Vagas) > 0 && (
                              <span>
                                {favorite.propertyData.Vagas}{" "}
                                {Number(favorite.propertyData.Vagas) === 1
                                  ? "Vaga"
                                  : "Vagas"}
                              </span>
                            )}
                            {Number(favorite.propertyData.AreaPrivativa) >
                              0 && (
                              <span>
                                {favorite.propertyData.AreaPrivativa}m²
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              router.push(`/place/${favorite.propertyId}`)
                            }
                            className={styles.viewButton}
                          >
                            Ver Detalhes
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
