const { send } = require("micro");
const dns = require("node-dns");

const isHostedOnNow = domain =>
  new Promise((resolve, reject) => {
    const question = dns.Question({ name: domain, type: "A" });
    const req = dns.Request({
      question: question,
      server: { address: "96.45.80.1", port: 53, type: "udp" },
      timeout: 1000
    });

    req.on("message", function(err, answer) {
      if (err) {
        return reject(err);
      }
      resolve(answer.header.rcode === 5);
    });
    req.on("timeout", reject);
    req.send();
  });

module.exports = async (req, res) => {
  const domain = req.url.split("/").pop();
  if (domain === "favicon.ico") return send(res, 404);
  try {
    let body = `<h1>Yes, ${domain} is hosted on now.sh</h1>`;
    if (await isHostedOnNow(domain)) {
      body = `<h1>No, ${domain} isn't hosted on now.sh</h1>`;
    }
    send(res, 200, body);
  } catch (err) {
    send(res, 500, "An error occurred.");
  }
};
