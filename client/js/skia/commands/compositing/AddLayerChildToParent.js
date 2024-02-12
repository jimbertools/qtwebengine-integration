function addLayerChildToParent(childId, parentId) {
    this.layers[parentId].baseLayer.addChild(this.layers[childId].baseLayer);
}

export default addLayerChildToParent;
