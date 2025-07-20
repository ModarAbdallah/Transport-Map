export default function Header({
  lang, setLang, title,
  routePref, setRoutePref,
  mapLayer, setMapLayer,
  mapMenuOpen, setMapMenuOpen
}) {
  const toggleMapMenu = () => {
    setMapMenuOpen(prev => !prev);
  };

  const handleSelectMapType = (type) => {
    setMapLayer(type);
    setMapMenuOpen(false);
  };

  return (
    <div style={styles.header}>
      <div style={styles.leftControls}>
        <div style={styles.dropdownContainer}>
          <button style={styles.mapIcon} onClick={toggleMapMenu}>🗺️</button>
          {mapMenuOpen && (
            <div style={styles.dropdown}>
              <div onClick={() => handleSelectMapType("streets")}>🛣️ خريطة طرق</div>
              <div onClick={() => handleSelectMapType("satellite")}>🛰️ قمر صناعي</div>
              <div onClick={() => handleSelectMapType("terrain")}>🌄 تضاريس</div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.title}>{title}</div>

      <button onClick={() => setLang(lang === "en" ? "ar" : "en")} style={styles.langButton}>
        {lang === "en" ? "AR" : "EN"}
      </button>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: "#2196f3",
    color: "white",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px",
    fontWeight: "bold",
    position: "relative"
  },
  leftControls: {
    position: "relative"
  },
  mapIcon: {
    fontSize: 22,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#fff"
  },
  dropdownContainer: {
    position: "relative"
  },
  dropdown: {
    position: "absolute",
    top: "35px",
    left: 0,
    backgroundColor: "#fff",
    color: "#000",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "5px",
    display: "flex",
    flexDirection: "column",
    zIndex: 999,
    width: "150px",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.2)"
  },
  title: {
    flex: 1,
    textAlign: "center"
  },
  langButton: {
    backgroundColor: "#fff",
    color: "#2196f3",
    border: "none",
    borderRadius: 5,
    padding: "5px 10px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};
