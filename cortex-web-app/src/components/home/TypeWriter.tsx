'use client'
import { useEffect } from "react";

    // TypewriterEffect component
export default function TypewriterEffect({ period, texts }: { period: string, texts: string[] }) {
    useEffect(() => {
      const typewriteElements = document.querySelectorAll('.typewrite');
      
      function typeWriter(element: Element) {
        const dataType = JSON.stringify(texts);
        const dataPeriod = period;
        if (dataType) {
          const parsedTexts = JSON.parse(dataType);
          let textIndex = 0;
          let charIndex = 0;
          let isDeleting = false;
          const periodValue = parseInt(dataPeriod || '2000');
          const wrap = element.querySelector('.wrap');
          
          function tick() {
            const fullText = parsedTexts[textIndex];
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
              textIndex = (textIndex + 1) % parsedTexts.length;
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
    }, [period, texts]);
  
    return (
      <p className="typewrite lead fs-4 mb-5" data-period={period} data-type={JSON.stringify(texts)}>
        <span className="wrap"></span>
      </p>
    );
  };
  