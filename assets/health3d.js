/* Lightweight WebGL visual layer for the Portfolio Health Check.
   Purely decorative — listens to the SAME #assetGrid clicks the existing
   scoring logic (assets/script.js) already handles, and never touches
   the score calculation itself. If WebGL isn't available or the user
   prefers reduced motion, the container is simply removed and the
   questionnaire works exactly as before. */
(function(){
  "use strict";

  function supportsWebGL(){
    try{
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e){ return false; }
  }

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var container = document.getElementById('healthVisual');
  if(!container) return;

  if(prefersReducedMotion || window.innerWidth < 720 || !supportsWebGL()){
    container.hidden = true;
    return;
  }

  // A representative subset of the real asset-chip categories (script.js
  // owns the full 12-category scoring logic — this is a decorative subset).
  var TRACKED = ['Mutual Funds', 'PMS', 'Direct Stocks', 'Fixed Deposits', 'Gold / SGBs', 'Real Estate'];

  window.addEventListener('load', function(){
    setTimeout(init, 60);
  });

  function init(){
    import('three').then(function(THREE){ build(THREE, container); }).catch(function(){ container.hidden = true; });
  }

  function build(THREE, el){
    var width = el.clientWidth || 140, height = el.clientHeight || 140;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    camera.position.set(0, 0.4, 4.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x33415c, 1.2));
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(2, 3, 3);
    scene.add(key);

    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 2),
      new THREE.MeshPhysicalMaterial({ color: 0x0d2142, metalness: 0.8, roughness: 0.3, clearcoat: 0.6 })
    );
    scene.add(core);

    var nodeGroup = new THREE.Group();
    scene.add(nodeGroup);
    var nodes = {};
    var count = TRACKED.length;
    TRACKED.forEach(function(name, i){
      var angle = (i / count) * Math.PI * 2;
      var radius = 1.35;
      var pos = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(i * 1.9) * 0.35, Math.sin(angle) * radius);

      var mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 16, 16),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xc9a86a : 0x00ae42, metalness: 0.6, roughness: 0.35, transparent: true, opacity: 0 })
      );
      mesh.position.copy(pos);
      mesh.scale.setScalar(0.001);
      nodeGroup.add(mesh);

      var line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), pos.clone()]),
        new THREE.LineBasicMaterial({ color: 0x00ae42, transparent: true, opacity: 0 })
      );
      nodeGroup.add(line);

      nodes[name] = { mesh: mesh, line: line, active: false };
    });

    function setActive(name, active){
      var n = nodes[name];
      if(!n) return;
      n.active = active;
    }

    function syncFromDOM(){
      document.querySelectorAll('#assetGrid .asset-chip').forEach(function(chip){
        setActive(chip.dataset.asset, chip.classList.contains('selected'));
      });
    }

    document.getElementById('assetGrid').addEventListener('click', function(e){
      var chip = e.target.closest('.asset-chip');
      if(!chip) return;
      // Read state after script.js's own handler (registered first) has already toggled it.
      setActive(chip.dataset.asset, chip.classList.contains('selected'));
    });
    var restartBtn = document.getElementById('hwRestart');
    if(restartBtn){ restartBtn.addEventListener('click', function(){ TRACKED.forEach(function(n){ setActive(n, false); }); }); }

    var clock = new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();
      core.rotation.y = t * 0.25;
      nodeGroup.rotation.y = t * 0.18;

      TRACKED.forEach(function(name){
        var n = nodes[name];
        var targetScale = n.active ? 1 : 0.001;
        var targetOpacity = n.active ? 0.95 : 0;
        n.mesh.scale.setScalar(THREE.MathUtils.lerp(n.mesh.scale.x, targetScale, 0.12));
        n.mesh.material.opacity = THREE.MathUtils.lerp(n.mesh.material.opacity, targetOpacity, 0.12);
        n.line.material.opacity = THREE.MathUtils.lerp(n.line.material.opacity, n.active ? 0.35 : 0, 0.12);
      });

      renderer.render(scene, camera);
    }
    animate();
  }
})();
