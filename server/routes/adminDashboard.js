router.get("/dashboard", async (req, res) => {

  const users = await User.countDocuments();
  const roadmaps = await Roadmap.countDocuments();
  const nodes = await Node.countDocuments();

  const activity = [
    {
      action: "System activity",
      target: `${nodes} nodes created`
    }
  ];

  res.json({
    stats: {
      users,
      roadmaps,
      nodes
    },
    activity
  });

});