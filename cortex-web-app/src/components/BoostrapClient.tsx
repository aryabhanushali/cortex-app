'use client'

import { useEffect } from 'react';
import AOS from 'aos';
export default function BoostrapClient() {
    useEffect(() => {
        require('bootstrap/dist/js/bootstrap.bundle.min.js');
        AOS.init({
            duration: 800,
            once: false,
          })
    }, []);

    return null;
}