// ===== Minimal 3D Brain STL Viewer =====
console.log('✅ index.js loaded');
import * as THREE from 'https://unpkg.com/three@0.159/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.159/examples/jsm/controls/OrbitControls.js?module';
import { STLLoader } from 'https://unpkg.com/three@0.159/examples/jsm/loaders/STLLoader.js?module';



function initBrainViewer(url = 'assets/brainModel/brain.stl') {
  const container = document.getElementById('brain-viewport');
  if (!container) return;

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(0, 0.2, 2.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.6;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xf3f5fb, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(1, 1, 1);
  scene.add(dir);

  const loader = new STLLoader();
  loader.load(
    url,
    (geometry) => {
    const material = new THREE.MeshPhysicalMaterial({
        // color: 0xf3f5fb,      
        metalness: 0.1,       
        roughness: 0.1,      
        clearcoat: 0.5,        
        clearcoatRoughness: 0.1,
        reflectivity: 0.6,    
        transparent: true,   
        opacity: 0.9    
  
    });

material.onBeforeCompile = (shader) => {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    `
      float grad = clamp((vViewPosition.y + 1.0) / 2.0, 0.0, 1.0);
      vec3 gradColor = mix(vec3(1.0,1.0,1.0), vec3(0.75,0.82,1.0), grad);
      gl_FragColor = vec4(gradColor, 1.0) * gl_FragColor;
      #include <dithering_fragment>
    `
  );
};
      const mesh = new THREE.Mesh(geometry, material);

        geometry.computeVertexNormals();  
        geometry.center();    

      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);
      mesh.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      mesh.scale.setScalar(1.2 / maxDim);
      mesh.rotation.x = -Math.PI /2;

      scene.add(mesh);

      let autoRotate = true;
      function tick(time) {
      requestAnimationFrame(tick);
      if (autoRotate) mesh.rotation.z += 0.001;


        const t = (Math.sin(time * 0.001) + 1) / 2; 
        const r = 0.75;               
        const g = 0.9;                
        const b = 0.85 + 0.3 * t; ;       
        mesh.material.color.setRGB(r, g, b);

        controls.update();
        renderer.render(scene, camera);
        }
        tick();

      controls.addEventListener('start', () => {
        autoRotate = false; 
        });

        controls.addEventListener('end', () => {
        autoRotate = true; 
        });
    },
    undefined,
    (err) => {
      console.error('STL load faied：', err);
      // container.innerHTML =
      //   '<div style="padding:12px;border-radius:12px;background:#f8d7da;color:#842029;font-size:14px;">⚠️ 模型加载失败，请检查路径和文件体积。</div>';
    }
  );

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  window.addEventListener('orientationchange', resize);
}

// ===== Neural Network Background Animation =====
function initNeuralNetwork() {
  const neuralCanvas = document.getElementById('neuralCanvas');
  if (!neuralCanvas) return;

  const ctx = neuralCanvas.getContext('2d');

  function resizeCanvas() {
    neuralCanvas.width = neuralCanvas.offsetWidth;
    neuralCanvas.height = neuralCanvas.offsetHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const nodes = [];
  const nodeCount = 40;

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * neuralCanvas.width,
      y: Math.random() * neuralCanvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }

  function animateNetwork() {
    ctx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);

    // Draw connections
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          ctx.strokeStyle = 'rgba(70, 85, 221, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes and update positions
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#4655dd';
      ctx.fill();

      // Update position
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges
      if (node.x < 0 || node.x > neuralCanvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > neuralCanvas.height) node.vy *= -1;
    });

    requestAnimationFrame(animateNetwork);
  }

  animateNetwork();
}

window.addEventListener('DOMContentLoaded', () => {
  initBrainViewer('assets/brainModel/brain.stl'); // <- 这里用你实际文件路径
  initNeuralNetwork();
});
