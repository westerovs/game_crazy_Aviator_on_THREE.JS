'use strict'

import * as THREE from '../lib/three.js'


// const canvas = document.getElementById('canvas')
const world = document.getElementById('fucking-world')

const COLORS = {
    red      : 0xf25346,
    white    : 0xd8d0d1,
    brown    : 0x59332e,
    pink     : 0xF5986E,
    brownDark: 0x23190f,
    blue     : 0x68c3c0,
};

let scene,
    camera,
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
    HEIGHT,
    WIDTH,
    renderer,
    container;

window.addEventListener('load', init, false)

function init() {
    // настройка сцены, камеры и рендера
    createScene();

    // добавление освещения сцены
    createLights();

    // добавление объектов на сцену
    createSea();
    // createPlane();
    // createSky();

    // запускаем цикл для обновления объектов на сцене
    // и перерасчет сцены в каждом кадре
    loop();
}


function createScene() {
    console.log('--- createScene ---')

    // Получаем ширину и высоту рабочей области
    // используем их для установки размера и пропорций камеры
    // а также для размера финального рендера
    WIDTH  = world.offsetWidth
    HEIGHT = world.offsetHeight


    // Создание сцены
    scene = new THREE.Scene()

    // Добавить эффект тумана на нашу сцену
    // его цвет мы возьмем из наших таблиц стилей, а не из переменной
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // Создадим камеру
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane   = 1;
    farPlane    = 10000;
    camera      = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );

    // Зададим позицию камере в пространстве
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 100;

    // Создадим рендер
    renderer = new THREE.WebGLRenderer({
        // Разрещить прозрачноть для сцены
        // чтобы видеть фон из CSS
        alpha: true,

        // Активируем антиалиасинг. Это может повлечь проблемы с производительностью,
        // но наш проект основан на низкополигональных моделях, поэтому должно зайти как по маслу.
        antialias: true
    });

    // Задаем размер рендеру,
    // в нашем случае это размер рабочей области
    renderer.setSize(WIDTH, HEIGHT);

    // Включаем рендер теней
    renderer.shadowMap.enabled = true;

    // Обратимся к DOM-элементу,
    // который создали в HTML, для рендера в него сцены.
    container = world
    container.appendChild(renderer.domElement); // создать canvas в fucking-world

    // Отлавливаем событие изменения размера экрана,
    // в котором мы запустим функцию handleWindowResize(), чтобы обновить камеру и рендер.
    window.addEventListener('resize', handleWindowResize, false);
}


function handleWindowResize() {
    console.log('+++ WindowResize +++')
    // обновим высоту и ширину камеры и рендера
    // Так как размер окна может меняться пользователем,
    // нам необходимо обновлять сцену, рендер и камеру после кажого изменения размера:
    WIDTH  = world.offsetWidth
    HEIGHT = world.offsetHeight
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}


// ----------------------------------------------------------
// --------------------- ОСВЕЩЕНИЕ СЦЕНЫ --------------------
// ----------------------------------------------------------
let hemisphereLight, shadowLight;

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


// ----------------------------------------------------------
// --------------------- СОЗДАНИЕ МОРЯ ----------------------
// ----------------------------------------------------------
// Сперва определим JS-объект нашего моря
const Sea = function () {

    // Создадим геометрию цилиндра
    // со следующими параметрами:
    // верхний радиус, нижний радиус, высота, количество сегментов по окружности, количество сегментов по вертикали
    var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

    // повернем наш объект по оси x
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    // создадим материал для нашего объекта
    var mat = new THREE.MeshPhongMaterial({
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

// Теперь мы инициализируем наше море и добавим его на сцену:

var sea;

function createSea() {
    sea = new Sea();

    // Подвинем объект в нижнюю часть нашей сцены
    sea.mesh.position.y = -600;

    // Добавим финальный меш на сцену
    scene.add(sea.mesh);
}

function loop(){
    // Вращаем пропеллер, море и небо
    // airplane.propeller.rotation.x += 0.3;
    sea.mesh.rotation.z += .005;
    // sky.mesh.rotation.z += .01;

    // рендерим сцену
    renderer.render(scene, camera);

    // снова вызываем фунцию loop
    requestAnimationFrame(loop);
}