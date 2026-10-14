import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="home-page">
      <section className="hero">
        <p className="eyebrow">
          ELEVATED SKINCARE
        </p>

        <h1>
          Simple skincare.
          <br />
          Luxurious results.
        </h1>

        <p className="hero-text">
          Discover a carefully selected collection of
          skincare essentials designed for your daily
          ritual.
        </p>

        <Link to="/products" className="primary-btn">
          Explore Collection
        </Link>
      </section>

      <section className="home-feature">
        <div>
          <span>01</span>
          <h2>Gentle</h2>
          <p>
            Thoughtfully selected products for everyday
            skincare.
          </p>
        </div>

        <div>
          <span>02</span>
          <h2>Simple</h2>
          <p>
            A straightforward collection without
            unnecessary complexity.
          </p>
        </div>

        <div>
          <span>03</span>
          <h2>Elegant</h2>
          <p>
            Skincare presented with a refined,
            luxurious touch.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Home;