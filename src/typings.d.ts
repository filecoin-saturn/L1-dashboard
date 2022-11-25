export declare global {
  function cl(): console.log;

  interface Window {
    cl: console.log;
  }

  interface Global {
    cl: console.log;
  }
}
