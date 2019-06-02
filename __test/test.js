const path = require('path');
const parseDependencies = require('../bundle').parseDependencies;
const getDenpendenciesGraph = require('../bundle').getDenpendenciesGraph;
const bundle = require('../bundle').bundle;

test('test parse file dependencies', () => {
    const dependenciesObj = parseDependencies('./__test/code/index.js');
    expect(dependenciesObj).toMatchSnapshot();
});

test('test parse file garph', () =>{
    const dependenciesGraph = getDenpendenciesGraph('./__test/code/index.js');
    expect(dependenciesGraph).toMatchSnapshot();
});

test('generate bundle file from entry', ()=>{
    const bundleDisFile = bundle('./__test/code/index.js');
    expect(bundleDisFile).toMatchSnapshot();
})