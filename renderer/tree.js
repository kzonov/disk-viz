export function removeNodeFromData(data, pathToRemove) {
  const copy = JSON.parse(JSON.stringify(data));

  function removeNode(node) {
    if (!node.children) return { node, sizeReduction: 0 };

    const kept = [];
    let sizeReduction = 0;

    for (const child of node.children) {
      if (child.path === pathToRemove) {
        sizeReduction += child.size;
      } else {
        const result = removeNode(child);
        kept.push(result.node);
        sizeReduction += result.sizeReduction;
      }
    }

    node.children = kept;
    node.size = Math.max(0, node.size - sizeReduction);
    return { node, sizeReduction };
  }

  const result = removeNode(copy);
  return result ? result.node : null;
}

export function applyExclusions(data, excludePaths) {
  if (!excludePaths || excludePaths.length === 0) return data;

  const excludeSet = new Set(excludePaths);
  const copy = JSON.parse(JSON.stringify(data));

  function removeNodes(node) {
    if (!node.children) return { node, sizeReduction: 0 };

    const kept = [];
    let sizeReduction = 0;

    for (const child of node.children) {
      if (excludeSet.has(child.path)) {
        sizeReduction += child.size;
      } else {
        const result = removeNodes(child);
        kept.push(result.node);
        sizeReduction += result.sizeReduction;
      }
    }

    node.children = kept;
    node.size = Math.max(0, node.size - sizeReduction);
    return { node, sizeReduction };
  }

  return removeNodes(copy).node;
}
