function WelcomeCard({ title, version }) {
  return (
    <section className="card">
      <h1>{title}</h1>
      <p>React 模板创建成功</p>
      <p>当前版本：{version}</p>
      <p>你现在可以开始开发自己的项目了。</p>
    </section>
  );
}

export default WelcomeCard;
