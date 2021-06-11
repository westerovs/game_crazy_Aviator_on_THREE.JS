import * as THREE from '../lib/three.js';

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

 в каком порядке необходимо создавать 3D-объект(меш):
    Создаем геометрию
    Создаем материал
    Объединяем геометрию и материал в меш
    Добавляем меш на нашу сцену
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

// ------------- море
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


// ------------- облака
const Cloud = function () {
    // Создаем пустой контейнер, который будет содержать составные части облаков (кубы)
    this.mesh = new THREE.Object3D();

    // Создаем геометрию куба
    // этот куб будет дублироваться для создания облаков
    const geom = new THREE.BoxGeometry(20, 20, 20);

    // создадим простой материал для кубов
    const mat = new THREE.MeshPhongMaterial({
        color: COLORS.white,
    });

    // продублируем куб рандомное количество раз
    const nBlocs = 3 + Math.floor(Math.random() * 3);
    // применим цикл для каждого куба и поместим их в наш меш
    for (let i = 0; i < nBlocs; i++) {
        // создадим меш путем клонирования куба циклом
        const m = new THREE.Mesh(geom, mat);

        // зададим случайную позицию и ротацию какждому кубу
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        // зададим случайным образом размер нашим кубам
        const s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);

        // позволим каждому кубу отбрасывать и преломлять тени
        m.castShadow    = true;
        m.receiveShadow = true;

        // добавим куб в наш контейнер облаков, который создали в начале этой функции
        this.mesh.add(m);
    }
}

// Создадим объект неба
class Sky {
    constructor(props) {
        // создадим пустой контейнер
        this.mesh = new THREE.Object3D();
        
        // выберем количество облаков, которые разместим на небе
        this.nClouds = 20;
        
        // Чтобы распределить облака равномерно,
        // нам необходимо разместить их с одинаковым промежутком друг от друга,
        // для этого мы рассчитаем величину угла для каждого следующего облака
        this.stepAngle = Math.PI * 2 / this.nClouds;
        
        // создадим облака для неба в цикле
        for (let i = 0; i < this.nClouds; i++) {
            const c = new Cloud();
            
            // зададим угол поворота и позицию для каждого облака
            // для этого мы используем немного тригонометрии
            const a = this.stepAngle * i; // это конечный угол поворота облака
            const h = 750 + Math.random() * 200; // это расстояние между центром оси и облаком
            
            // Тригонометрия!!! Я надеюсь вы помните что учили в школе :)
            // если же нет:
            // мы просто конвертируем полярные координаты (угол, расстояние) в Декартовые координаты (x, y)
            c.mesh.position.y = Math.sin(a) * h;
            c.mesh.position.x = Math.cos(a) * h;
            
            // поворачиваем облако относительно его позиции
            c.mesh.rotation.z = a + Math.PI / 2;
            
            // для лучшего результата, мы разместим облака
            // на случайной глубине на нашей сцене
            c.mesh.position.z = -400 - Math.random() * 400;
            
            // также установим случайный размер для каждого облака
            const s = 1 + Math.random() * 2;
            c.mesh.scale.set(s, s, s);
            
            // не забудьте добавить каждое облако в наш контейнер
            this.mesh.add(c.mesh);
        }
    }
    
    createSky = () => {
        console.log('create Sky')
        this.mesh.position.y = -600;
        scene.add(this.mesh);
    }
}

const sky = new Sky()


// ----------> 5 управление
function init() {
    // настройка сцены, камеры и рендера
    createScene();
    // добавление освещения сцены
    createLights();
    
    // добавление мешей на сцену
    // createPlane()
    createSea();
    // createPlane();
    sky.createSky();

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

// ----------> запуск !
window.addEventListener('load', init)
