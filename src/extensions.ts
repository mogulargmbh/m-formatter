export {};

declare module "@microsoft/powerquery-parser/lib/language/ast/ast"
{
  interface INode
  {
    handle: Node;
  }
}
declare global {
  interface Array<T> {
    contains(arg: T | ((el: T) => boolean)): boolean;
    any(fn?: (el: T, i?: number) => boolean): boolean;
    remove(arg: T | ((el: T) => boolean));
    all(fn?: (el: T) => boolean): boolean;
    orderBy(fn: (el: T) => any): Array<T>;
    selectMany<TProp>(fn: (el: T) => TProp[]): Array<TProp>;
    last(): T;
    first(): T;
  }
}

Array.prototype.last = function()
{
  return this[this.length -1];
}

Array.prototype.first = function()
{
  return this[0];
}

Array.prototype.contains = function(arg) {
  if(typeof(arg) == "function")
    return this.find(arg) != null;

  return this.indexOf(arg) >= 0;
};


Array.prototype.orderBy = function(arg) {
  this.sort((a,b) => {
    let _a = arg(a);
    let _b = arg(b);
    return _a == _b ? 0 : (_a < _b ? -1 : 1);
  });
  return this;
};

Array.prototype.remove = function(arg) {
  if(typeof(arg) == "function")
  {
    for(let el of this.filter(arg))
    {
      this.splice(this.indexOf(el), 1);
    }
  }
  else
  {
    this.splice(this.indexOf(arg), 1);
  }
};

Array.prototype.any = function(fn, i?) {
  if(fn != null)
    return this.filter((el, i) => fn(el, i)).length != 0;
  else
    return this.length != 0;
};

Array.prototype.all = function(fn) {
  for(let el of this)
  {
    if(fn(el) == false)
      return false;
  }
  return true;
};

Array.prototype.selectMany = function(fn) {
  return this
    .map(fn)
    .reduce((a,b) => {
      return a.concat(b);
    }, []);
};