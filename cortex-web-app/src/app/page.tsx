import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Stats from "@/components/home/Stats";
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="main">
        {/* Hero Section */}
        <section id="hero" className="hero section">
          <div className="container">
            <div className="row gy-4">
              <div className="col-lg-7 order-2 order-lg-1 d-flex flex-column justify-content-center">
                <h1 data-aos="fade-up">Virtual Visual Cortex</h1>
                {/* <p data-aos="fade-up" data-aos-delay="100" className="typed-out">Predicting Brain Responses in Real Time with Cutting-Edge AI Models</p> */}

                <p data-aos="fade-up" data-aos-delay="100" className="typewrite mb-5" data-period="2000" data-type='["Predict responses in the brain", "Simulate your own experiments", "Learn more about human brain areas", "Upload images and map them to neural patterns"]'><span className="wrap"></span></p>

                <div className="d-flex flex-column" data-aos="fade-up" data-aos-delay="200">
                  <Link href="lab-page.html" className="btn-get-started w-auto mb-2">Predict Brain Responses <i className="bi bi-arrow-right"></i></Link>
                  <Link href="scoreboard-page.html" className="btn-get-started w-auto mb-2">Check Model Performance <i className="bi bi-arrow-right"></i></Link>
                  {/* <a href="https://www.youtube.com/watch?v=qPix_X-9t7E" className="glightbox btn-watch-video d-flex align-items-center justify-content-center ms-0 ms-md-4 mt-4 mt-md-0"><i className="bi bi-play-circle"></i><span>Watch Video</span></a> */}
                </div>
              </div>
              <div className="col-lg-5 order-1 order-lg-2 hero-img" data-aos="zoom-out">
                <img src="assets/img/logo.svg" className="img-fluid animated" alt="" />
              </div>
            </div>
          </div>
        </section>{/* /Hero Section */}

      <Stats />

        {/* Faq Section */}
        <section id="faq" className="faq section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>F.A.Q</h2>
            <p>Frequently Asked Questions</p>
          </div>{/* End Section Title */}

          <div className="container">
            <div className="row">
              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
                <div className="faq-container">
                  <div className="faq-item faq-active">
                    <h3>Why work with Cortex?</h3>
                    <div className="faq-content">
                      <p></p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right"></i>
                  </div>{/* End Faq item*/}

                  <div className="faq-item">
                    <h3>How can I use this platform?</h3>
                    <div className="faq-content">
                      <p></p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right"></i>
                  </div>{/* End Faq item*/}

                  <div className="faq-item">
                    <h3>How do I contribute my own dataset?</h3>
                    <div className="faq-content">
                      <p></p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right"></i>
                  </div>{/* End Faq item*/}
                </div>
              </div>{/* End Faq Column*/}

              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div className="faq-container">
                  <div className="faq-item">
                    <h3>How do I get involved?</h3>
                    <div className="faq-content">
                      <p></p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right"></i>
                  </div>{/* End Faq item*/}

                  <div className="faq-item">
                    <h3>Does Cortex store my data?</h3>
                    <div className="faq-content">
                      <p></p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right"></i>
                  </div>{/* End Faq item*/}

                  <div className="faq-item">
                    <h3>What regions are supported?</h3>
                    <div className="faq-content">
                      <p></p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right"></i>
                  </div>{/* End Faq item*/}
                </div>
              </div>{/* End Faq Column*/}
            </div>
          </div>
        </section>{/* /Faq Section */}
      </main>

      <Footer />
      </>
  );
}
