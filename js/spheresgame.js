var camera, scene, renderer;
var radius = 75;
var enemiesSize = 30;
var totalEnemies = enemiesSize;
// x y z
var moveSpeed = [0, 0, 0];

init();
document.addEventListener("keydown", onDocumentKeyDown, false);

function init() {
  camera = new THREE.Camera( 75, 680 / 480, 1, 10000 );
  camera.position.z = 1000;
  scene = new THREE.Scene();

  player = new THREE.Mesh( new THREE.SphereGeometry(radius, 16, 16), new THREE.MeshLambertMaterial({color: 0x00bb00, shading: THREE.FlatShading}));
  player.position.set(0, 0, 0);
  moveSpeed = [0, 0, 0];
  scene.addObject(player);

  totalEnemies = enemiesSize;
  enemies = new Array(enemiesSize);
  enemiesSpeed = new Array(enemiesSize);

  for (var i = 0; i < enemiesSize; i++) {
    var tempEnemy;
    var collision = true;
    while (collision == true) {
      var rad = Math.floor(Math.random() * 100);
      var x = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 600);
      var y = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 400);
      var z = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 400);
      var sx = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10);
      var sy = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10);
      var sz = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10);
      tempEnemy = new THREE.Mesh(new THREE.SphereGeometry(rad, 16, 16), new THREE.MeshLambertMaterial({color: 0xbb0000, shading: THREE.FlatShading}));
      tempEnemy.position.set(x, y, z);
      collision = isCollide(player.position, tempEnemy.position, player.boundRadius, tempEnemy.boundRadius);
    }
    enemies[i] = tempEnemy;
    enemiesSpeed[i] = [sx, sy, sz];
    scene.addObject(tempEnemy);
  }

  scene.addLight( new THREE.AmbientLight(0xffffff));
  pointLight = new THREE.PointLight(0xdddddd, 1, 1000);
  pointLight.position.set(0, 0, 500);
  scene.addLight(pointLight);

  if (renderer == null) {
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(680, 500);
    document.getElementById("canvas").appendChild( renderer.domElement );
  }
}

function animate() {
  // Include examples/js/RequestAnimationFrame.js for cross-browser compatibility.
  if (player == null)
    return;
  if (player.position.x < -(window.innerWidth/2) || player.position.x > window.innerWidth/2)
    moveSpeed[0] *= -1;
  if (player.position.y < -(window.innerHeight/2) || player.position.y > window.innerHeight/2)
    moveSpeed[1] *= -1;
  if (player.position.z < -400 || player.position.z > 400)
    moveSpeed[2] *= -1;
  player.position.x += moveSpeed[0];
  player.position.y += moveSpeed[1];
  player.position.z += moveSpeed[2];
  player.rotation.x += 0.01;
  player.rotation.y += 0.01;

  for (var i = 0; i < enemiesSize; i++) {
    if (enemies[i] == null) {
      continue;
    }
    if (enemies[i].boundRadius < player.boundRadius) {
      enemies[i].materials[0].color = new THREE.Color(0x0000bb);
    }
    else {
      enemies[i].materials[0].color = new THREE.Color(0xbb0000);
    }
    enemies[i].position.x += enemiesSpeed[i][0];
    enemies[i].position.y += enemiesSpeed[i][1];
    enemies[i].position.z += enemiesSpeed[i][2];
    enemies[i].rotation.x += 0.01;
    enemies[i].rotation.y += 0.01;

    var playerCollide = isCollide(player.position, enemies[i].position, player.boundRadius, enemies[i].boundRadius);
    if (playerCollide == true && player.boundRadius < enemies[i].boundRadius) {
      scene.removeObject(player);
      player = null;
      alert("YOU LOSE");
      return;
    }
    else if (playerCollide == true && player.boundRadius > enemies[i].boundRadius) {
      scene.removeObject(player);
      var newPlayer = new THREE.Mesh( new THREE.SphereGeometry(player.boundRadius + enemies[i].boundRadius / 4, 16, 16), new THREE.MeshLambertMaterial({color: 0x00bb00, shading: THREE.FlatShading}));
      newPlayer.rotation = player.rotation;
      newPlayer.position = player.position;
      player = newPlayer;
      scene.addObject(player);
      totalEnemies--;
      if (totalEnemies == 0) {
        alert("YOU WIN");
      }
      scene.removeObject(enemies[i]);
      enemies[i] = null;
      continue;
    }

    for (var j = 0; j < enemiesSize; j++) {
      if (i == j || enemies[j] == null) {
        continue;
      }
      var enemyCollision = isCollide(enemies[i].position, enemies[j].position, enemies[i].boundRadius, enemies[j].boundRadius);
      if (enemyCollision && enemies[i].boundRadius > enemies[j].boundRadius) {
        scene.removeObject(enemies[i]);
        scene.removeObject(enemies[j]);
        totalEnemies--;
        var newEnemy = new THREE.Mesh(new THREE.SphereGeometry(enemies[i].boundRadius + enemies[j].boundRadius / 4, 16, 16), new THREE.MeshLambertMaterial({color: 0xbb0000, shading: THREE.FlatShading}));
        newEnemy.rotation = enemies[i].rotation;
        newEnemy.position = enemies[i].position;
        enemies[i] = newEnemy;
        enemies[j] = null;
        scene.addObject(enemies[i]);
      }
    }

    if (enemies[i].position.x < -(window.innerWidth/2) || enemies[i].position.x > window.innerWidth/2)
      enemiesSpeed[i][0] *= -1;
    if (enemies[i].position.y < -(window.innerHeight/2) || enemies[i].position.y > window.innerHeight/2)
      enemiesSpeed[i][1] *= -1;
    if (enemies[i].position.z < -400 || enemies[i].position.z > 400)
      enemiesSpeed[i][2] *= -1;
  }

  requestAnimationFrame( animate );
  render();
}

function render() {
  renderer.render( scene, camera );
}

function isCollide(pos1, pos2, rad1, rad2) {
  var dist = Math.sqrt((pos2.x-pos1.x)*(pos2.x-pos1.x) + (pos2.y-pos1.y)*(pos2.y-pos1.y) + (pos2.z-pos1.z)*(pos2.z-pos1.z));
  if (dist < rad1 + rad2) {
    return true;
  }
  else {
    return false;
  }
}

function onDocumentKeyDown(event) {
  switch (event.keyCode) {
    // left arrow key
    case 37:
      moveSpeed[0] -= 1;
      break;
      // right arrow key
    case 39:
      moveSpeed[0] += 1;
      break;
      // down arrow key
    case 38:
      moveSpeed[1] += 1;
      break;
      // up arrow key
    case 40:
      moveSpeed[1] -= 1;
      break;
      // z key
    case 90:
      moveSpeed[2] -= 1;
      break;
      // c key
    case 67:
      moveSpeed[2] += 1
        break;
      // r key - restart
    case 82:
      init();
      animate();
      break;
  }
}
