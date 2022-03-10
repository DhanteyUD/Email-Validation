import FileTree from './fileTree';

export function createFileTree(input) {
  const fileTree = new FileTree();

  const parent = [...input];
  const orderedParent = parent.splice(0, 1);
  let parentId = orderedParent[0].id;

  for (let childNode of parent) {
    childNode = parent.find((e) => e.parentId === parentId);
    orderedParent.push(childNode);
    parentId = childNode.id;
  }

  for (const inputNode of orderedParent) {
    const parentNode = inputNode.parentId
      ? fileTree.findNodeById(inputNode.parentId)
      : null;

    fileTree.createNode(
      inputNode.id,
      inputNode.name,
      inputNode.type,
      parentNode
    );
  }

  return fileTree;
}
