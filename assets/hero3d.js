/* Real WebGL "Wealth Architecture" hero visual — Three.js.
   Loads only after window 'load', only on capable devices, and only
   when the user hasn't asked for reduced motion. Falls back to the
   existing CSS glass/metal panel (.wealth-arch-core / .wealth-arch-nodes)
   otherwise — that markup is never removed, only visually superseded. */
(function(){
  "use strict";

  function supportsWebGL(){
    try{
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e){ return false; }
  }

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var container = document.getElementById('wealthArch');

  if(!container || prefersReducedMotion || window.innerWidth < 720 || !supportsWebGL()){
    return; // CSS fallback stays as-is
  }

  window.addEventListener('load', function(){
    setTimeout(init, 60); // let the initial paint settle before pulling in Three.js
  });

  function init(){
    import('three').then(function(THREE){ build(THREE, container); }).catch(function(){ /* CSS fallback remains visible */ });
  }

  function build(THREE, el){
    var width = el.clientWidth, height = el.clientHeight;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.className = 'wealth-arch-canvas';
    el.insertBefore(renderer.domElement, el.firstChild);
    el.classList.add('has-webgl');

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    scene.add(new THREE.AmbientLight(0x33415c, 1.1));
    var key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(3, 4, 5);
    scene.add(key);
    var goldRim = new THREE.PointLight(0xc9a86a, 6, 12);
    goldRim.position.set(-3, 1.5, 2.5);
    scene.add(goldRim);
    var blueFill = new THREE.PointLight(0x5b8cff, 5, 12);
    blueFill.position.set(2.5, -2, -2);
    scene.add(blueFill);

    var rig = new THREE.Group();
    scene.add(rig);

    // Central wealth core — dark glass / brushed metal
    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 3),
      new THREE.MeshPhysicalMaterial({
        color: 0x0d2142, metalness: 0.85, roughness: 0.28,
        clearcoat: 0.7, clearcoatRoughness: 0.18, reflectivity: 0.6
      })
    );
    rig.add(core);

    // Thin architectural ring accents
    [ [1.55, 0x5b8cff, 0.35], [1.75, 0xc9a86a, 0.55] ].forEach(function(cfg){
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(cfg[0], 0.01, 8, 96),
        new THREE.MeshBasicMaterial({ color: cfg[1], transparent: true, opacity: cfg[2] })
      );
      ring.rotation.x = Math.PI / 2.3;
      rig.add(ring);
    });

    // Orbiting asset-class nodes + connecting lines
    var nodeCount = 5;
    var nodeGroup = new THREE.Group();
    rig.add(nodeGroup);
    var lineMat = new THREE.LineBasicMaterial({ color: 0x5b8cff, transparent: true, opacity: 0.28 });
    for(var i = 0; i < nodeCount; i++){
      var angle = (i / nodeCount) * Math.PI * 2;
      var radius = 2.15;
      var y = Math.sin(i * 1.7) * 0.55;
      var x = Math.cos(angle) * radius;
      var z = Math.sin(angle) * radius;
      var isGold = i % 2 === 0;
      var node = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 20, 20),
        new THREE.MeshStandardMaterial({
          color: isGold ? 0xc9a86a : 0x5b8cff,
          emissive: isGold ? 0x5c4a26 : 0x1c2f5c,
          metalness: 0.6, roughness: 0.3
        })
      );
      node.position.set(x, y, z);
      nodeGroup.add(node);

      var linePts = [new THREE.Vector3(0, 0, 0), node.position.clone()];
      var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePts), lineMat);
      nodeGroup.add(line);
    }

    var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    el.addEventListener('pointermove', function(e){
      var rect = el.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    el.addEventListener('pointerleave', function(){ mouseX = 0; mouseY = 0; });

    var ro = new ResizeObserver(function(){
      var w = el.clientWidth, h = el.clientHeight;
      if(w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(el);

    var clock = new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      rig.rotation.y = t * 0.09;
      nodeGroup.rotation.y = -t * 0.15;
      core.position.y = Math.sin(t * 0.6) * 0.06;

      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      rig.rotation.x = targetY * 0.18;
      camera.position.x = targetX * 0.4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();
  }
})();
