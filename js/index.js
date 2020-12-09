'use strict'
import * as THREE from '../lib/three.js'
/*
    ИЕРАРХИЯ ОТОБРАЖЕНИЯ:

    __________РЕНДЕРЕР__________
    ↓                          ↓
 камера                   ___сцена___
                          ↓         ↓
       [источники света...]     ___[меши...]___
                                ↓             ↓
                        геометрия             ______материал______
                                              ↓         ↓        ↓
                                       текстуры       цвета      правила отображения
*/
const world       = document.getElementById('fucking-world')
const worldWidth  = world.offsetWidth
const worldHeight = world.offsetHeight

const COLORS = {
    red      : 0xf25346,
    white    : 0xd8d0d1,
    brown    : 0x59332e,
    pink     : 0xF5986E,
    brownDark: 0x23190f,
    blue     : 0x68c3c0,
};

// ----------> 1 RENDER
const renderer = new THREE.WebGLRenderer({
    // Разрещить прозрачноть для сцены
    // чтобы видеть фон из CSS
    alpha: true,

    // Активируем антиалиасинг. Это может повлечь проблемы с производительностью,
    // но наш проект основан на низкополигональных моделях, поэтому должно зайти как по маслу.
    antialias: true
});


// ----------> 2 CAMERA
const fieldOfView = 60;
const aspectRatio = worldWidth / worldHeight;
const nearPlane   = 1;
const farPlane    = 10000;
const camera      = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)


// ----------> 3 SCENE
const scene = new THREE.Scene()

function createScene() {
    console.log('--- createScene ---')

    // Добавить эффект тумана на нашу сцену
    // его цвет мы возьмем из наших таблиц стилей, а не из переменной
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // Зададим позицию камере в пространстве
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 100;

    // Задаем размер рендеру,
    // в нашем случае это размер рабочей области
    renderer.setSize(worldWidth, worldHeight);

    // Включаем рендер теней
    renderer.shadowMap.enabled = true;

    // создать canvas в fucking-world и рендера в него сцены.
    world.appendChild(renderer.domElement);

    // Отлавливаем событие изменения размера экрана,
    // в котором мы запустим функцию handleWindowResize(), чтобы обновить камеру и рендер.
    window.addEventListener('resize', handleWindowResize, false);
}


// ----------> 4 меш
const Sea = function () {
    // Создадим геометрию цилиндра
    // верхний радиус, нижний радиус, высота, количество сегментов по окружности, количество сегментов по вертикали
    const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

    // повернем наш объект по оси x
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    // создадим материал для нашего объекта
    const mat = new THREE.MeshPhongMaterial({
        color      : COLORS.blue,
        transparent: true,
        opacity    : 0.6,
        shading    : THREE.FlatShading,
    });

    // Для создания объекта в Three.js, нам необходимо создать меш,
    // который является совокупностью созданной ранее геометрии и материала
    this.mesh = new THREE.Mesh(geom, mat);

    // Разрешим морю отбрасывать тени
    this.mesh.receiveShadow = true;
}
let sea;
// Теперь мы инициализируем наше море и добавим его на сцену:
function createSea() {
    sea = new Sea();

    // Подвинем объект в нижнюю часть нашей сцены
    sea.mesh.position.y = -600;

    // Добавим море меш на сцену
    scene.add(sea.mesh);
}

// ----------> 5 управление
function startGame() {
    // настройка сцены, камеры и рендера
    createScene();
    // добавление освещения сцены
    createLights();
    // добавление мешей на сцену
    createSea();
    // createPlane();
    // createSky();

    // цикл для обновления объектов
    loop();
}

function loop() {
    // Вращаем пропеллер, море и небо
    sea.mesh.rotation.z += .005;
    // sky.mesh.rotation.z += .01;
    // airplane.propeller.rotation.x += 0.3;

    // рендерим сцену
    renderer.render(scene, camera);

    requestAnimationFrame(loop);
}

// ----------------- вспомогательные функции -----------------
let hemisphereLight = null
let shadowLight     = null

function createLights() {
    console.log('--- createLights ---')
    // Полушарный свет - это градиентный свет
    // первый параметр это цвет неба, второй параметр - цвет земли,
    // третий параметр - интенсивность света
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

    // Направленный свет светит в определенном направлении из точки,
    // это работает как солнце, что значит что продуцируемые лучи параллельны.
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // Устанавливаем направление света
    shadowLight.position.set(150, 350, 350);

    // Разрешаем отбрасывание теней
    shadowLight.castShadow = true;

    // Определяем видимую область теней
    shadowLight.shadow.camera.left   = -400;
    shadowLight.shadow.camera.right  = 400;
    shadowLight.shadow.camera.top    = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near   = 1;
    shadowLight.shadow.camera.far    = 1000;

    // Задайте разрешение теней,
    // но имейте ввиду, чем оно больше, тем ниже производительность.
    shadowLight.shadow.mapSize.width  = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // Добавляем наше освещение на сцену
    scene.add(hemisphereLight);
    scene.add(shadowLight);
}

// перерисовывает canvas при измении размера окна, т.к размер окна может меняться
function handleWindowResize() {
    console.log('+++ WindowResize +++')
    const worldWidthResize  = world.offsetWidth
    const worldHeightResize = world.offsetHeight
    renderer.setSize(worldWidthResize, worldHeightResize);
    camera.aspect = worldWidthResize / worldHeightResize;
    camera.updateProjectionMatrix();
}

// запуск !
window.addEventListener('load', startGame)
