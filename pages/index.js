/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
function App() {
  // passing the backend data to react
  const [backendData, setBackendData] = useState([]);
  useEffect(() => {
    fetch("api/getData")
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
        setBackendData(res);
      });
  }, []);

  let resultHistory = backendData.map((x, i) => {
    return (
      <>
        <div className={"resultHistoryRow"} id={i} onClick={handleSelect}>
          <span className="resultHistoryCell">{x.date}</span>
          <span className="resultHistoryCell">{x.no}</span>
          <span className="resultHistoryCell">{x.sno}</span>
        </div>
      </>
    );
  });

  let fillInData = backendData.map((x) => [x.no.split("+"), parseInt(x.sno)]);

  const [resultTable, setResultTable] = useState(false);

  function handleClick() {
    setResultTable(!resultTable);
  }

  function handleSelect(event) {
    let clickedID = event.currentTarget.id;
    console.log(clickedID);
    let resultNumber = fillInData[clickedID][0].map((x) => parseInt(x));
    let resultSpecialNumber = fillInData[clickedID][1];
    for (let i = 0; i < 6; i++) {
      setFormData((prev) => {
        return {
          ...prev,
          [`num${i + 1}`]: resultNumber[i],
          specialNum: resultSpecialNumber,
        };
      });
    }
    setResultTable(!resultTable);
  }

  // function of calculating result array
  function checkMarkSix(LotteryArr, boughtArr, specialNum) {
    // Find subset function
    function subset(arra, arra_size) {
      var result_set = [],
        result;
      for (var x = 0; x < Math.pow(2, arra.length); x++) {
        result = [];
        let i = arra.length - 1;
        do {
          if ((x & (1 << i)) !== 0) {
            result.push(arra[i]);
          }
        } while (i--);

        if (result.length === arra_size) {
          result_set.push(result);
        }
      }

      return result_set;
    }

    LotteryArr.push(specialNum);
    let goodNum = boughtArr.filter((x) => LotteryArr.includes(x));
    let falseNum = boughtArr.filter((x) => !goodNum.includes(x));
    if (
      goodNum.length < 3 ||
      (goodNum.length === 3 && goodNum.includes(specialNum))
    ) {
      alert("Oops Sorry Good Luck Next Time");
      window.location.reload();
    }

    if (goodNum.length >= 3 && falseNum.length > 0) {
      let wholeArr = [];
      for (let i = 0; i < goodNum.length - 2; i++) {
        let firstHalfLength = goodNum.length - i;
        let firstHalf = subset(goodNum, firstHalfLength).filter(
          (x) => x.length !== 3 || !x.includes(specialNum)
        );
        let lastHalf = subset(falseNum, 6 - firstHalfLength);
        firstHalf.forEach((x) => x.sort((a, b) => a - b));
        lastHalf.forEach((x) => x.sort((a, b) => a - b));
        for (let j = 0; j < firstHalf.length; j++) {
          if (lastHalf.length > 0) {
            for (let k = 0; k < lastHalf.length; k++) {
              let newArr = firstHalf[j].concat(lastHalf[k]);
              wholeArr.push(newArr);
            }
          } else if (firstHalf.length === 6) {
            wholeArr.push(firstHalf);
          }
        }
      }
      return wholeArr;
    }

    if (falseNum.length === 0 && goodNum.length === 6) {
      let wholeArr = [[]];
      wholeArr.push(goodNum);
      return wholeArr;
    }

    if (falseNum.length === 0 && goodNum.length > 6) {
      let unsortedWholeArr = subset(goodNum, 6);
      let wholeArr = unsortedWholeArr.map((x) => x.sort((a, b) => a - b));
      return wholeArr;
    }
  }

  // form data control
  const [formData, setFormData] = useState({
    num1: "",
    num2: "",
    num3: "",
    num4: "",
    num5: "",
    num6: "",
    specialNum: "",
    boughtNumber: "",
  });

  const [markSixNumbers, setMarkSixNumbers] = useState([]);
  const [result, setResult] = useState([]);
  const [money, setMoney] = useState(null);
  const [prizeListState, setprizeListState] = useState("prize-list-hidden");

  function handleChange(e) {
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [e.target.name]: e.target.value,
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    let boughtNumber = formData.boughtNumber
      .split(/,|\s+/)
      .map((x) => parseInt(x, 10))
      .filter((x) => x);
    let specialNumber = parseInt(formData.specialNum, 10);
    let normalGoodNum = [];
    console.log(formData.boughtNumber.split(/,|\s+/));
    for (let x = 1; x <= 6; x++) {
      normalGoodNum.push(parseInt(formData[`num${x}`], 10));
    }
    console.log(formData.boughtNumber.split(/,|\s+/));
    console.log(new Set(boughtNumber));
    if (
      boughtNumber.length !== new Set(boughtNumber).size ||
      normalGoodNum.length !== new Set(normalGoodNum).size ||
      normalGoodNum.includes(specialNumber)
    ) {
      alert("Please do not enter duplicate number");
      window.location.reload();
    }
    if (boughtNumber.length < 6) {
      alert("please enter 6 or more numbers");
    }

    if (
      formData.boughtNumber.split(/,|\s+/).length !== boughtNumber.length ||
      Object.values(formData).some((value) => value > 49 || value <= 0) ||
      boughtNumber.some((value) => value > 49 || value <= 0)
    ) {
      alert("Please only enter number 1 to 49");
      window.location.reload();
    }
    if (Object.values(formData).some((value) => !value)) {
      alert("please fill in all the boxes");
    }

    if (boughtNumber.some((x) => x > 49))
      alert("Numbers cannot be larger than 49");
    setResult(checkMarkSix(normalGoodNum, boughtNumber, specialNumber));
    normalGoodNum = [];
    for (let x = 1; x <= 6; x++) {
      normalGoodNum.push(parseInt(formData[`num${x}`], 10));
    }
    setMarkSixNumbers(normalGoodNum);
    setprizeListState("prize-list-shown");
    window.scrollBy(0, 500);
  }

  function handleSpend() {
    let boughtNumber = formData.boughtNumber
      .split(/,|\s+/)
      .map((x) => parseInt(x, 10))
      .filter((x) => x);
    let specialNumber = parseInt(formData.specialNum, 10);
    let normalGoodNum = [];
    console.log(formData.boughtNumber.split(/,|\s+/));
    for (let x = 1; x <= 6; x++) {
      normalGoodNum.push(parseInt(formData[`num${x}`], 10));
    }
    console.log(formData.boughtNumber.split(/,|\s+/));
    console.log(new Set(boughtNumber));
    if (
      boughtNumber.length !== new Set(boughtNumber).size ||
      normalGoodNum.length !== new Set(normalGoodNum).size ||
      normalGoodNum.includes(specialNumber)
    ) {
      alert("Please do not enter duplicate number");
      window.location.reload();
    }
    if (boughtNumber.length < 6) {
      alert("please enter 6 or more numbers");
    }

    if (
      formData.boughtNumber.split(/,|\s+/).length !== boughtNumber.length ||
      Object.values(formData).some((value) => value > 49 || value <= 0) ||
      boughtNumber.some((value) => value > 49 || value <= 0)
    ) {
      alert("Please only enter number 1 to 49");
      window.location.reload();
    }
    if (Object.values(formData).some((value) => !value)) {
      alert("please fill in all the boxes");
    }

    if (boughtNumber.some((x) => x > 49))
      alert("Numbers cannot be larger than 49");

    let nfact = boughtNumber.length;
    let nMinusR = boughtNumber.length - 6;
    if (boughtNumber.length < 6) return alert("Please enter 6 or more numbers");
    if (boughtNumber.length === 6) return setMoney("$10");
    let rfact = 720;
    for (let i = nfact - 1; i > 0; i--) {
      nfact = nfact * i;
    }
    console.log(nfact);
    for (let i = nMinusR - 1; i > 0; i--) {
      nMinusR = nMinusR * i;
    }
    return setMoney(`$${(nfact / (rfact * nMinusR)) * 10}`);
  }

  function getPrizeAmount() {
    let normalGoodNum = [];
    for (let x = 1; x <= 6; x++) {
      normalGoodNum.push(parseInt(formData[`num${x}`], 10));
    }

    let prize = result.map((arr) => {
      let score = 0;
      for (let i = 0; i < 6; i++) {
        if (normalGoodNum.includes(arr[i])) {
          score += 1;
        } else if (arr[i] === parseInt(formData.specialNum, 10)) {
          score += 0.5;
        }
      }
      switch (score) {
        case 6:
          return "First Prize";
        case 5.5:
          return "Second Prize";
        case 5:
          return "Third Prize";
        case 4.5:
          return 9600;
        case 4:
          return 640;
        case 3.5:
          return 320;
        case 3:
          return 40;
      }
    });
    return prize;
  }

  let finalPrize = getPrizeAmount();

  function getPrizeTotal(prizeArr) {
    let stringPrize = prizeArr.filter((x) => typeof x === "string");
    let numberPrize = prizeArr.filter((x) => typeof x === "number");
    let initialValue = 0;
    let totalAmount = numberPrize.reduce(
      (previousValue, currentValue) => previousValue + currentValue,
      initialValue
    );
    let fullString = stringPrize.concat(`$${totalAmount}`);
    if (fullString.filter((x) => x === "Second Prize").length > 1) {
      fullString.splice(
        fullString.indexOf("Second Prize"),
        fullString.filter((x) => x === "Second Prize").length,
        `${fullString.filter((x) => x === "Second Prize").length}x Second Prize`
      );
    }

    if (fullString.filter((x) => x === "Third Prize").length > 1) {
      fullString.splice(
        fullString.indexOf("Third Prize"),
        fullString.filter((x) => x === "Third Prize").length,
        `${fullString.filter((x) => x === "Third Prize").length}x Third Prize`
      );
    }
    return fullString;
  }

  let prizeTotal = getPrizeTotal(finalPrize);

  const finalResult = result.map((arr, i) => (
    // eslint-disable-next-line react/jsx-key
    <h1 className="arr">
      {result.length === 1 ? (
        <span>{arr}</span>
      ) : (
        arr.map((number, i) => (
          <span
            key={i}
            className={
              markSixNumbers.includes(number)
                ? "good-number"
                : number === parseInt(formData.specialNum, 10)
                ? "good-special-number"
                : "arr-number"
            }
          >
            {number}
          </span>
        ))
      )}
      <span className="prize-amount">
        {typeof finalPrize[i] === "number"
          ? `$${finalPrize[i]}`
          : finalPrize[i]}
      </span>
    </h1>
  ));

  const prizeList = (
    <h1 className={prizeListState}>
      Congratulations! You have won :{" "}
      {prizeTotal.map((x, i) => (
        <p key={i}>{x}</p>
      ))}
    </h1>
  );

  return (
    <div>
      <h1 className="title">Check MarkSix</h1>
      <div className="main">
        <h1 className="inside-title">Please enter the MarkSix result :</h1>
        <button className="draw-history-button" onClick={handleClick}>
          Select From Past 30 Times Draw Record
        </button>
        {resultTable ? (
          <div className="table">
            <div className={"resultHistoryTitle"}>
              <span className="resultHistoryCell">Draw Date</span>
              <span className="resultHistoryCell">Result</span>
              <span className="resultHistoryCell">Special Number</span>
            </div>
            {resultHistory}
          </div>
        ) : null}

        <input
          className="draw-number"
          type="number"
          name="num1"
          maxLength="2"
          value={formData.num1}
          onChange={handleChange}
        />
        <input
          className="draw-number"
          type="number"
          name="num2"
          maxLength="2"
          value={formData.num2}
          onChange={handleChange}
        />
        <input
          className="draw-number"
          type="number"
          name="num3"
          maxLength="2"
          value={formData.num3}
          onChange={handleChange}
        />
        <input
          className="draw-number"
          type="number"
          name="num4"
          maxLength="2"
          value={formData.num4}
          onChange={handleChange}
        />
        <input
          className="draw-number"
          type="number"
          name="num5"
          maxLength="2"
          value={formData.num5}
          onChange={handleChange}
        />
        <input
          className="draw-number"
          type="number"
          name="num6"
          maxLength="2"
          value={formData.num6}
          onChange={handleChange}
        />

        <h3 className="special-number">Special Number: </h3>
        <input
          className="draw-special-number"
          type="number"
          name="specialNum"
          maxLength="2"
          value={formData.specialNum}
          onChange={handleChange}
        />

        <h1 className="inside-title">What numbers have you bought?</h1>
        <h4>(Could be more than 6 numbers)</h4>
        <h4>use ',' or spacebar to split the numbers</h4>
        <input
          className="bought-number-field"
          name="boughtNumber"
          onChange={handleChange}
        />
        <button className="spend-how-much" onClick={handleSpend}>
          How much did I spend
        </button>
        <span className="money">{money}</span>
        <button onClick={handleSubmit} className="submit-button">
          Submit
        </button>
        {prizeList}
        <div id="final-result-container">{finalResult}</div>
      </div>
    </div>
  );
}

export default App;
