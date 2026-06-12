figma.showUI(__html__, { width: 400, height: 600 });

interface AuditMessage {
  type: string;
  url?: string;
  useChrome?: boolean;
}

figma.ui.onmessage = async (msg: AuditMessage) => {
  if (msg.type === 'start-audit') {
    try {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Please select a frame first'
        });
        return;
      }

      const frame = selection[0];
      
      if (frame.type !== 'FRAME' && frame.type !== 'COMPONENT') {
        figma.ui.postMessage({
          type: 'error',
          message: 'Please select a frame or component'
        });
        return;
      }

      const frameData = await extractFrameData(frame);
      
      const response = await fetch('http://localhost:3001/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: msg.url,
          useChrome: msg.useChrome,
          frameData: frameData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        createPinsForIssues(frame, result.issues);
        figma.ui.postMessage({
          type: 'audit-complete',
          issues: result.issues,
          screenshot: result.screenshot
        });
      } else {
        figma.ui.postMessage({
          type: 'error',
          message: result.message || 'Audit failed'
        });
      }
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

async function extractFrameData(node: any) {
  const layers: any[] = [];
  function traverse(child: any) {
    const layer = {
      id: child.id,
      name: child.name,
      type: child.type,
      x: child.x,
      y: child.y,
      width: child.width,
      height: child.height,
      properties: extractProperties(child)
    };
    layers.push(layer);
    if ('children' in child) {
      for (const c of child.children) {
        traverse(c);
      }
    }
  }
  traverse(node);
  return {
    id: node.id,
    name: node.name,
    width: node.width,
    height: node.height,
    layers
  };
}

function extractProperties(node: any): any {
  const props: any = {};
  if ('fontSize' in node) props.fontSize = node.fontSize;
  if ('fontWeight' in node) props.fontWeight = node.fontWeight;
  if ('fontFamily' in node) props.fontFamily = node.fontFamily;
  if ('lineHeightPx' in node) props.lineHeight = node.lineHeightPx;
  if ('cornerRadius' in node) props.borderRadius = node.cornerRadius;
  return props;
}

function createPinsForIssues(frame: any, issues: any[]): void {
  for (const issue of issues) {
    if (issue.layerId) {
      const layer = figma.getNodeById(issue.layerId);
      if (layer) {
        const comment = figma.createComment();
        comment.text = `${issue.type}: ${issue.message}`;
        comment.x = layer.x + layer.width / 2;
        comment.y = layer.y + layer.height / 2;
      }
    }
  }
}
