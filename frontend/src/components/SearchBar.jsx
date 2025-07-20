export default function SearchBar({ t, handleSearch }) {
  return (
    <div style={{ padding: 5, display: "flex" }}>
      <input id="search" placeholder={t.search} style={{ flex: 1, padding: 5 }} />
      <button onClick={handleSearch}>{t.search}</button>
    </div>
  );
}
