// async function init() {
//   // array of single byte i.e instruction of wasm
//   // this byte array is just an example
//   //   const byteArray = new Int8Array([
//   //     0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60,
//   //     0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01,
//   //     0x03, 0x73, 0x75, 0x6d, 0x00, 0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20,
//   //     0x00, 0x20, 0x01, 0x6a, 0x0b, 0x00, 0x18, 0x04, 0x6e, 0x61, 0x6d, 0x65,
//   //     0x01, 0x06, 0x01, 0x00, 0x03, 0x73, 0x75, 0x6d, 0x02, 0x09, 0x01, 0x00,
//   //     0x02, 0x00, 0x01, 0x61, 0x01, 0x01, 0x62,
//   //   ]);

//   // this way we can share variable to wasm
//   const memory = new WebAssembly.Memory({ initial: 1 }); // inital:1 means 1page of memory i.e of 64kb

//   // this way we can share function to wasm
//   const importObject = {
//     js: {
//       mem: memory,
//     },
//     console: {
//       log: () => {
//         console.log("Just logging something!");
//       },
//       error: () => {
//         console.log("I am just error");
//       },
//     },
//   };

//   const response = await fetch("sum.wasm");
//   const buffer = await response.arrayBuffer();

//   const wasm = await WebAssembly.instantiate(buffer, importObject);
//   const sumFuntion = wasm.instance.exports.sum;

//   // we are getting variable shared by wasm
//   //   const wasmMemory = wasm.instance.exports.mem;
//   //   const uint8Array = new Uint8Array(wasmMemory.buffer, 0, 2); // 0,2 means 1st 2 byte
//   //   const hiText = new TextDecoder().decode(uint8Array);
//   //   console.log("variable shared by wasm ", hiText);

//   const uint8Array = new Uint8Array(memory.buffer, 0, 2);
//   const hiText = new TextDecoder().decode(uint8Array);
//   console.log("variable shared by wasm ", hiText);

//   const result = sumFuntion(10, 50);
//   console.log(result, wasm.instance);
// }
// init();

// // Importing function from JS to Wasm
// // (module
// //  (import "console" "log" (func $log))
// // (import "console" "error" (func $error))
// //   (func $sum (param $a i32) (param $b i32) (result i32)
// //     call $log
// //       call $error
// //     local.get $a
// //     local.get $b
// //     i32.add
// //   )
// //   (export "sum" (func $sum))

// // LOADING MEMORY AND SHARING IT (BASICALLY SHARING VARAIBLES)
// // SHARING VARIABLE CREATE IN WASM TO JS
// // Here mem is created, we store "hi" in mem and export it
// // (module
// //   (import "console" "log" (func $log))
// //   (import "console" "error" (func $error))
// //   (memory $mem 1)
// //   (data (i32.const 0) "Hi")
// //   (func $sum (param $a i32) (param $b i32) (result i32)
// //     call $log
// //     call $error
// //     local.get $a
// //     local.get $b
// //     i32.add
// //   )
// //   (export "mem" (memory $mem))
// //   (export "sum" (func $sum))
// // )

// // SHARING MEMORY CREATED IN JS TO WASM

// // HERE WE ARE RECEIVING MEMORY SPACE FROM  JS AND WE ARE WRITING INTO THAT EMPTY MEMORY REFER LINE NO. 94
// // THERE 1 MEANS 1PAGE OF MEMORY I.E OF 64KB
// // AND THEN THIS MEMORY IS PRESENT IN JS SO WE CAN ACCESS INFO IN THAT

// // (module
// //   (import "console" "log" (func $log))
// //   (import "console" "error" (func $error))
// //   (memory (import "js" "mem") 1)
// //   (data (i32.const 0) "Hi")
// //   (func $sum (param $a i32) (param $b i32) (result i32)
// //     call $log
// //     call $error
// //     local.get $a
// //     local.get $b
// //     i32.add
// //   )

// //   (export "sum" (func $sum))
// // )

import init, { World, Direction, GameStatus } from "snake_game";
import { rnd } from "./utils/rnd";

init().then((wasm) => {
  const CELL_SIZE = 20;
  const WORLD_WIDTH = 8;
  const snakeSpawnIdx = rnd(WORLD_WIDTH * WORLD_WIDTH);

  const world = World.new(WORLD_WIDTH, snakeSpawnIdx);
  const worldWidth = world.width();

  const points = document.getElementById("points");
  const gameControlBtn = document.getElementById("game-control-btn");
  const gameStatus = document.getElementById("game-status");
  const canvas = <HTMLCanvasElement>document.getElementById("snake-canvas");
  const ctx = canvas.getContext("2d");

  canvas.height = worldWidth * CELL_SIZE;
  canvas.width = worldWidth * CELL_SIZE;

  // const snakeCellPtr = world.snake_cells();
  // const snakeLen = world.snake_length();

  // // this will extra info from snakecellptr to our wasm.memory.buffer
  // const snakeCells = new Uint32Array(
  //   wasm.memory.buffer,
  //   snakeCellPtr,
  //   snakeLen
  // );
  // console.log("snakecells", snakeCells);

  gameControlBtn.addEventListener("click", (_) => {
    const status = world.game_status();

    if (status === undefined) {
      gameControlBtn.textContent = "Playing...";
      world.start_game();
      play();
    } else {
      location.reload();
    }
  });

  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowUp":
        world.change_snake_dir(Direction.Up);
        break;
      case "ArrowRight":
        world.change_snake_dir(Direction.Right);
        break;
      case "ArrowDown":
        world.change_snake_dir(Direction.Down);
        break;

      case "ArrowLeft":
        world.change_snake_dir(Direction.Left);
        break;
    }
  });

  function drawWorld() {
    ctx.beginPath();

    // draw column
    for (let x = 0; x < worldWidth + 1; x++) {
      ctx.moveTo(CELL_SIZE * x, 0);
      ctx.lineTo(CELL_SIZE * x, worldWidth * CELL_SIZE);
    }

    // draw row
    for (let y = 0; y < worldWidth + 1; y++) {
      ctx.moveTo(0, CELL_SIZE * y);
      ctx.lineTo(worldWidth * CELL_SIZE, CELL_SIZE * y);
    }

    ctx.stroke();
  }

  function drawReward() {
    const idx = world.reward_cell();
    const col = idx % worldWidth;
    const row = Math.floor(idx / worldWidth);

    ctx.beginPath();

    ctx.fillStyle = "#FF0000";
    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    ctx.stroke();
  }

  function drawGameStatus() {
    const status = world.game_status();
    gameStatus.textContent = world.game_status_text();
    points.textContent = world.points().toString();

    if (status == GameStatus.Won || status == GameStatus.Lost) {
      gameControlBtn.textContent = "Re-Play";
    }
  }
  function drawSnake() {
    // const snakeIdx = world.snake_head_idx();

    const snakeCells = new Uint32Array(
      wasm.memory.buffer,
      world.snake_cells(),
      world.snake_length()
    );

    snakeCells
      .slice()
      .reverse()
      .forEach((cellIdx, i) => {
        const col = cellIdx % worldWidth;
        const row = Math.floor(cellIdx / worldWidth);

        ctx.fillStyle = i === snakeCells.length - 1 ? "#7878db" : "#000000";

        ctx.beginPath();

        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });

    ctx.stroke();
  }

  function paint() {
    drawWorld();
    drawSnake();
    drawReward();
    drawGameStatus();
  }

  function play() {
    const status = world.game_status();

    if (status == GameStatus.Won || status == GameStatus.Lost) {
      gameControlBtn.textContent = "Re-Play";
      return;
    }
    const fps = 3;
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      world.step();
      paint();
      // this method is called before browser repaint
      requestAnimationFrame(play);
    }, 1000 / fps);
  }

  paint();
});
