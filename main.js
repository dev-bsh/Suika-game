import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";
import "./style.css";

const engine = Engine.create();

// 렌더링 설정
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F9F3DD",
    width: 620,
    height: 850
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: {fillStyle: "#F3D680"}
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: {fillStyle: "#F3D680"}
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: {fillStyle: "#F3D680"}
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: 'topLine',
  isStatic: true,
  // 감지용으로 사용
  isSensor: true,
  render: {fillStyle: "#F3D680"}
});


// engine의 world에 추가
World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;

// 과일 추가 함수
const addFruit = () => {
  // 0~4까지 랜덤
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  // 과일 설정
  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    // 생성하자마자 sleep 상태
    isSleeping: true,
    render: {
      sprite: {texture: `${fruit.name}.png`}
    },
    // 크기별 탄성
    restitution: 0.7 - (index/10)
  });

  currentBody = body;
  currentFruit = fruit;

  // 과일이랑 내려가는 선
  World.add(world, body);
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
      break;
  }
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case "KeyA":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30) {
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 2,
            y: currentBody.position.y
          });
        }
      }, 1);
      break;
    
    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 590) {
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 2,
            y: currentBody.position.y
          });
        }
      }, 1);
      break;

    case "KeyS":
      clearInterval(interval);
      interval = null;
      currentBody.isSleeping = false;
      disableAction = true;
      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

// 충돌 이벤트 (과일, topLine 충돌)
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const index = collision.bodyA.index;
    // 마지막 과일이면 return
    if (index === FRUITS.length-1) {
      return;
    }

    if (collision.bodyA.index === collision.bodyB.index) {
      World.remove(world, [collision.bodyA, collision.bodyB]);
      const newFruit = FRUITS[index+1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: {texture: `${newFruit.name}.png`}
          },
          index: index + 1,
        }
      );

      World.add(world, newBody);
    }

    if (!disableAction && (collision.bodyA.name === 'topLine' || collision.bodyB.name === 'topLine'))
      alert('game over')

  });
});

addFruit();