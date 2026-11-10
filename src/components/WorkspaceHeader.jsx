export default function WorkspaceHeader({ eyebrow = 'ELPARAISO · TEAM WORKSPACE', title, description, actions }) {
  return <header className="workspace-page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="workspace-header-actions">{actions}</div>}</header>;
}
