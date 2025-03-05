export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
      }}
    >
      <img
        src="loading.gif"
        alt="loading"
        style={{ width: "20vw", height: "20vw" }}
      />
    </div>
  );
}
