'use client'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Stats from "@/components/home/Stats";
import { useEffect } from "react";

// TODO: Make this a component a server component
export default function Home() {
  // Initialize typewriter effect on client side
  useEffect(() => {
    const typewriteElements = document.querySelectorAll('.typewrite');
    
    function typeWriter(element: Element) {
      const dataType = element.getAttribute('data-type');
      const dataPeriod = element.getAttribute('data-period');
      if (dataType) {
        const texts = JSON.parse(dataType);
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const period = parseInt(dataPeriod || '2000');
        const wrap = element.querySelector('.wrap');
        
        function tick() {
          const fullText = texts[textIndex];
          let updatedText = isDeleting 
            ? fullText.substring(0, charIndex - 1) 
            : fullText.substring(0, charIndex + 1);
          
          if (wrap) wrap.textContent = updatedText;
          
          if (isDeleting) {
            charIndex--;
          } else {
            charIndex++;
          }
          
          if (!isDeleting && charIndex === fullText.length) {
            isDeleting = true;
            setTimeout(() => tick(), 1000);
          } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(() => tick(), 500);
          } else {
            setTimeout(() => tick(), isDeleting ? 50 : 100);
          }
        }
        
        tick();
      }
    }
    
    typewriteElements.forEach(element => {
      typeWriter(element);
    });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section id="hero" className="hero section position-relative overflow-hidden">
          <div className="container">
            <div className="row gy-5 align-items-center">
              <div className="col-lg-8 order-2 order-lg-1 d-flex flex-column justify-content-center">
                <h1 className="display-4 fw-bold mb-4" data-aos="fade-up">Virtual Visual Cortex</h1>
                
                <div className="typewriter-container" data-aos="fade-up" data-aos-delay="100">
                  <p className="typewrite lead fs-4 mb-5" data-period="2000" data-type='["Predict responses in the brain", "Simulate your own experiments", "Learn more about human brain areas", "Upload images and map them to neural patterns"]'>
                    <span className="wrap"></span>
                  </p>
                </div>

                <div className="d-flex flex-column flex-md-row gap-3" data-aos="fade-up" data-aos-delay="200">
                  <Link href="/lab" className="btn btn-primary btn-lg px-4 py-3 rounded-pill shadow-sm">
                    Predict Brain Responses <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
                  <Link href="/scoreboard" className="btn btn-outline-primary btn-lg px-4 py-3 rounded-pill">
                    View Model Performance <i className="bi bi-graph-up ms-2"></i>
                  </Link>
                </div>
                
                <div className="mt-5 d-none d-md-block" data-aos="fade-up" data-aos-delay="300">
                  <div className="d-flex align-items-center gap-3">
                    <div className="badge bg-light text-dark px-3 py-2 rounded-pill">
                      <i className="bi bi-journal-code me-2"></i> Open Source
                    </div>
                    <div className="badge bg-light text-dark px-3 py-2 rounded-pill">
                      <i className="bi bi-cpu me-2"></i> AI-Powered
                    </div>
                    <div className="badge bg-light text-dark px-3 py-2 rounded-pill">
                      <i className="bi bi-brain me-2"></i> Neuroscience
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 order-1 order-lg-2 hero-img" data-aos="zoom-out">
                <div className="position-relative d-flex justify-content-center align-items-center">
                  <img 
                    src="assets/img/logo.svg" 
                    className="img-fluid animated" 
                    alt="Cortex Logo" 
                    style={{
                      filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))",
                      maxHeight: "400px"
                    }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-circle"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="position-absolute top-0 end-0 d-none d-lg-block" style={{ zIndex: -1, opacity: 0.1 }}>
            <svg width="600" height="600" viewBox="0 0 600 600">
              <g transform="translate(300,300)">
                <path d="M153,-193.8C197.5,-159.5,232.9,-111.3,247.4,-56.9C261.9,-2.5,255.4,58.1,226.5,103.5C197.5,148.9,146.1,179.1,91.8,201.6C37.5,224.1,-19.6,238.9,-74.4,228.2C-129.2,217.5,-181.6,181.3,-211.9,132.6C-242.2,83.9,-250.3,22.7,-239.4,-33.8C-228.5,-90.3,-198.6,-142.1,-156.3,-177.4C-114,-212.7,-59.5,-231.5,-2.7,-228.3C54.1,-225.1,108.5,-228.1,153,-193.8Z" fill="#4e73df" />
              </g>
            </svg>
          </div>
          
          <div className="position-absolute bottom-0 start-0 d-none d-lg-block" style={{ zIndex: -1, opacity: 0.1 }}>
            <svg width="500" height="500" viewBox="0 0 600 600">
              <g transform="translate(300,300)">
                <path d="M153,-193.8C197.5,-159.5,232.9,-111.3,247.4,-56.9C261.9,-2.5,255.4,58.1,226.5,103.5C197.5,148.9,146.1,179.1,91.8,201.6C37.5,224.1,-19.6,238.9,-74.4,228.2C-129.2,217.5,-181.6,181.3,-211.9,132.6C-242.2,83.9,-250.3,22.7,-239.4,-33.8C-228.5,-90.3,-198.6,-142.1,-156.3,-177.4C-114,-212.7,-59.5,-231.5,-2.7,-228.3C54.1,-225.1,108.5,-228.1,153,-193.8Z" fill="#4e73df" />
              </g>
            </svg>
          </div>
        </section>

        <Stats />

        {/* Features Section */}
        <section id="features" className="section py-5 bg-light">
          <div className="container section-title text-center mb-5" data-aos="fade-up">
            <h2>How Cortex Works</h2>
            <p>Bridging AI and Neuroscience</p>
          </div>

          <div className="container">
            <div className="row g-4">
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="feature-icon bg-primary bg-gradient text-white rounded-circle mb-4 mx-auto">
                      <i className="bi bi-upload fs-4"></i>
                    </div>
                    <h3 className="h4 mb-3">Upload Images</h3>
                    <p className="text-muted">Upload your own images to see how they would activate different regions of the human visual cortex.</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="feature-icon bg-primary bg-gradient text-white rounded-circle mb-4 mx-auto">
                      <i className="bi bi-cpu fs-4"></i>
                    </div>
                    <h3 className="h4 mb-3">AI Processing</h3>
                    <p className="text-muted">Our models analyze your images and predict neural responses based on data from real fMRI experiments.</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="feature-icon bg-primary bg-gradient text-white rounded-circle mb-4 mx-auto">
                      <i className="bi bi-graph-up fs-4"></i>
                    </div>
                    <h3 className="h4 mb-3">Visualize Results</h3>
                    <p className="text-muted">See detailed visualizations of predicted brain activity across different visual regions like FFA, PPA, and more.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Faq Section */}
        <section id="faq" className="faq section py-5">
          <div className="container section-title text-center mb-5" data-aos="fade-up">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about Cortex</p>
          </div>

          <div className="container">
            <div className="row g-4">
              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
                <div className="accordion" id="faqAccordion1">
                  <div className="accordion-item border-0 mb-3 shadow-sm rounded">
                    <h2 className="accordion-header">
                      <button className="accordion-button rounded" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                        Why work with Cortex?
                      </button>
                    </h2>
                    <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion1">
                      <div className="accordion-body">
                        <p>Cortex provides a unique platform for researchers, educators, and AI enthusiasts to explore the intersection of computer vision models and human brain activity. Our tools allow you to simulate fMRI experiments without the need for expensive equipment or specialized knowledge.</p>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 mb-3 shadow-sm rounded">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed rounded" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                        How can I use this platform?
                      </button>
                    </h2>
                    <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion1">
                      <div className="accordion-body">
                        <p>You can upload your own images in the Lab section to see predicted brain responses. Our platform is designed for both researchers who want to test hypotheses and educators who want to demonstrate how the visual cortex processes images. No coding or technical expertise required!</p>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 mb-3 shadow-sm rounded">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed rounded" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                        How do I contribute my own dataset?
                      </button>
                    </h2>
                    <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion1">
                      <div className="accordion-body">
                        <p>We welcome contributions from researchers with fMRI datasets. Please contact our team through the website to discuss collaboration opportunities. We can integrate your dataset into our platform, making it available for prediction and comparison with existing models.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div className="accordion" id="faqAccordion2">
                  <div className="accordion-item border-0 mb-3 shadow-sm rounded">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed rounded" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                        How do I get involved?
                      </button>
                    </h2>
                    <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion2">
                      <div className="accordion-body">
                        <p>There are multiple ways to get involved with Cortex. You can contribute to our open-source codebase on GitHub, share your research findings using our platform, or collaborate on new features and models. We also welcome feedback and suggestions from users at all levels.</p>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 mb-3 shadow-sm rounded">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed rounded" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                        Does Cortex store my data?
                      </button>
                    </h2>
                    <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#faqAccordion2">
                      <div className="accordion-body">
                        <p>We temporarily process your uploaded images to generate predictions, but we don't permanently store your images unless you explicitly opt in for research purposes. Your privacy is important to us, and all data handling complies with current privacy standards.</p>
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item border-0 mb-3 shadow-sm rounded">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed rounded" type="button" data-bs-toggle="collapse" data-bs-target="#faq6">
                        What regions are supported?
                      </button>
                    </h2>
                    <div id="faq6" className="accordion-collapse collapse" data-bs-parent="#faqAccordion2">
                      <div className="accordion-body">
                        <p>Cortex currently supports predictions for key visual processing regions including FFA (face recognition), PPA (place/scene processing), EBA (body recognition), OFA (facial features), and several others. We're continuously expanding our coverage to include more specialized brain regions.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <style jsx>{`
        .feature-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .bg-gradient-circle {
          background: radial-gradient(circle, rgba(78,115,223,0.1) 0%, rgba(255,255,255,0) 70%);
        }
        
        .typewriter-container {
          min-height: 60px;
        }
        
        .typewrite .wrap {
          border-right: 0.08em solid #4e73df;
          padding-right: 5px;
        }
        
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2rem;
          }
          
          .typewrite {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </>
  );
}
