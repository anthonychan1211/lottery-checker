import React from "react";

const getData = async (req, res) => {
  const data = await fetch(
    "https://bet.hkjc.com/contentserver/jcbw/cmc/last30draw.json"
  );
  const feedBack = await data.json();
  console.log(feedBack);
  res.status(200).json(feedBack);
};

export default getData;
