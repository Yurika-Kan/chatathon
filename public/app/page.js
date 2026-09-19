export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: 700 }}>Chatathon 2026</h1>
      <p style={{ fontSize: "1.2rem", marginTop: "0.5rem", opacity: 0.6 }}>
        Coming soon.
      </p>
    </div>
  );
}
