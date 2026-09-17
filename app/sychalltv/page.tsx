export default function SycHallTvPage() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#07111e'
      }}
    >
      <iframe
        src="/sychalltv/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Squantum Yacht Club Hall Display"
      />
    </div>
  );
}
