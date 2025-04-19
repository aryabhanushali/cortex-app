'use client'

import { useState, useEffect } from 'react';

export default function Stats() {
    const [counts, setCounts] = useState({
        users: 0,
        models: 0,
        images: 0,
        institutions: 0
    });

    useEffect(() => {
        const targetCounts = {
            users: 232,
            models: 50,
            images: 1463,
            institutions: 2
        };

        const duration = 1000; // 1 second in milliseconds
        const frameRate = 60;
        const totalFrames = duration / (1000 / frameRate);
        let frame = 0;

        const interval = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            
            if (progress >= 1) {
                setCounts(targetCounts);
                clearInterval(interval);
            } else {
                setCounts({
                    users: Math.floor(targetCounts.users * progress),
                    models: Math.floor(targetCounts.models * progress),
                    images: Math.floor(targetCounts.images * progress),
                    institutions: Math.floor(targetCounts.institutions * progress)
                });
            }
        }, 1000 / frameRate);

        return () => clearInterval(interval);
    }, []);

    return (
        <section id="stats" className="stats section">
            <div className="container" data-aos="fade-up" data-aos-delay="100">
                <div className="row gy-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="stats-item d-flex align-items-center w-100 h-100">
                            <i className="bi bi-emoji-smile color-blue flex-shrink-0"></i>
                            <div>
                                <span className="purecounter">{counts.users}</span>
                                <p>Users</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="stats-item d-flex align-items-center w-100 h-100">
                            <i className="bi bi-journal-richtext color-orange flex-shrink-0" style={{color: "#ee6c20"}}></i>
                            <div>
                                <span className="purecounter">{counts.models}</span>
                                <p>Models tested</p>
                            </div>
                        </div>
                    </div>{/* End Stats Item */}

                    <div className="col-lg-3 col-md-6">
                        <div className="stats-item d-flex align-items-center w-100 h-100">
                            <i className="bi bi-camera color-green flex-shrink-0" style={{color: "#15be56"}}></i>
                            <div>
                                <span className="purecounter">{counts.images}</span>
                                <p>Images processed</p>
                            </div>
                        </div>
                    </div>{/* End Stats Item */}

                    <div className="col-lg-3 col-md-6">
                        <div className="stats-item d-flex align-items-center w-100 h-100">
                            <i className="bi bi-people color-pink flex-shrink-0" style={{color: "#bb0852"}}></i>
                            <div>
                                <span className="purecounter">{counts.institutions}</span>
                                <p>Institutions Covered</p>
                            </div>
                        </div>
                    </div>{/* End Stats Item */}
                </div>
            </div>
        </section>
    );
}
