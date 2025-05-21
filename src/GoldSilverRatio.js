import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Area,
  ReferenceArea
} from "recharts";

const CONVERSION_FACTOR = 31;

function GoldSilverRatio() {
  const [currency, setCurrency] = useState("$");
  const [unit, setUnit] = useState("oz"); // "oz" or "g"

  // Price states (in current unit). For oz: Gold [500,5000], Silver [3.8,500]
  const [goldPrice, setGoldPrice] = useState(2000);
  const [silverPrice, setSilverPrice] = useState(25);

  const [goldInput, setGoldInput] = useState("2000");
  const [silverInput, setSilverInput] = useState("25");

  const [ratioLock, setRatioLock] = useState(false);
  const [lockedRatio, setLockedRatio] = useState(goldPrice / silverPrice);

  // Detect if mobile (screen width < 600px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Slider boundaries based on selected unit.
  const minGold = unit === "oz" ? 500 : 16;
  const maxGold = unit === "oz" ? 5000 : 162;
  const minSilver = unit === "oz" ? 3.8 : 0.12;
  const maxSilver = unit === "oz" ? 500 : 16;

  // Slider step values for smooth increments.
  const goldStep = unit === "oz" ? 1 : 0.01;
  const silverStep = unit === "oz" ? 0.1 : 0.01;

  const clampGold = (val) => Math.min(Math.max(val, minGold), maxGold);
  const clampSilver = (val) => Math.min(Math.max(val, minSilver), maxSilver);

  // Calculate ratio; if not locked, force into [10,130].
  let ratio = goldPrice / silverPrice;
  if (!ratioLock) {
    if (ratio < 10) ratio = 10;
    if (ratio > 130) ratio = 130;
  }

  // Handle unit change: convert current values.
  const handleUnitChange = (newUnit) => {
    if (newUnit === unit) return;
    let newGold, newSilver;
    if (newUnit === "g") {
      newGold = parseFloat((goldPrice / CONVERSION_FACTOR).toFixed(2));
      newSilver = parseFloat((silverPrice / CONVERSION_FACTOR).toFixed(2));
    } else {
      newGold = parseFloat((goldPrice * CONVERSION_FACTOR).toFixed(2));
      newSilver = parseFloat((silverPrice * CONVERSION_FACTOR).toFixed(2));
    }
    setGoldPrice(newGold);
    setSilverPrice(newSilver);
    setGoldInput(String(newGold.toFixed(2)));
    setSilverInput(String(newSilver.toFixed(2)));
    setUnit(newUnit);
  };

  // Lock toggle.
  const handleLockToggle = () => {
    if (!ratioLock) {
      setLockedRatio(goldPrice / silverPrice);
    }
    setRatioLock(!ratioLock);
  };

  // Update gold price.
  const applyGold = (g) => {
    if (ratioLock) {
      const newSilver = clampSilver(g / lockedRatio);
      setGoldPrice(g);
      setSilverPrice(newSilver);
      setSilverInput(String(newSilver.toFixed(2)));
    } else {
      let s = silverPrice;
      const rawR = g / s;
      if (rawR < 10) s = g / 10;
      else if (rawR > 130) s = g / 130;
      const clampedS = clampSilver(s);
      setGoldPrice(g);
      setSilverPrice(clampedS);
      setSilverInput(String(clampedS.toFixed(2)));
    }
  };

  // Update silver price.
  const applySilver = (s) => {
    if (ratioLock) {
      const newGold = clampGold(s * lockedRatio);
      setSilverPrice(s);
      setGoldPrice(newGold);
      setGoldInput(String(newGold.toFixed(2)));
    } else {
      let g = goldPrice;
      const rawR = g / s;
      if (rawR < 10) g = s * 10;
      else if (rawR > 130) g = s * 130;
      const clampedG = clampGold(g);
      setSilverPrice(s);
      setGoldPrice(clampedG);
      setGoldInput(String(clampedG.toFixed(2)));
    }
  };

  // Slider handlers now update the text inputs with full decimals.
  const handleGoldSlider = (val) => {
    const g = clampGold(Number(val));
    setGoldInput(String(g.toFixed(2)));
    applyGold(g);
  };

  const handleSilverSlider = (val) => {
    const s = clampSilver(Number(val));
    setSilverInput(String(s.toFixed(2)));
    applySilver(s);
  };

  // Text input handlers.
  const handleGoldInputChange = (val) => setGoldInput(val);
  const handleSilverInputChange = (val) => setSilverInput(val);

  const handleGoldBlur = () => {
    const parsed = parseFloat(goldInput);
    if (isNaN(parsed)) {
      setGoldInput(String(goldPrice.toFixed(2)));
      return;
    }
    const g = clampGold(parsed);
    setGoldInput(String(g.toFixed(2)));
    applyGold(g);
  };

  const handleSilverBlur = () => {
    const parsed = parseFloat(silverInput);
    if (isNaN(parsed)) {
      setSilverInput(String(silverPrice.toFixed(2)));
      return;
    }
    const s = clampSilver(parsed);
    setSilverInput(String(s.toFixed(2)));
    applySilver(s);
  };

  // Recalculate ratio.
  ratio = goldPrice / silverPrice;
  if (!ratioLock) {
    if (ratio < 10) ratio = 10;
    if (ratio > 130) ratio = 130;
  }

  // Chart data for area fill.
  const chartData = [
    { ratioVal: 10, x: 0 },
    { ratioVal: 130, x: 1 }
  ];

  // STYLES

  const containerStyle = {
    maxWidth: "950px",
    margin: "40px auto",
    background: "#183965",
    color: "white",
    fontFamily: "'DM Serif Display', serif",
    border: "0.125px solid #AA8355",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    padding: "20px",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: "20px"
  };

  const leftPaneStyle = {
    width: isMobile ? "100%" : "50%",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  };

  const rightPaneStyle = {
    width: isMobile ? "100%" : "50%",
    height: isMobile ? "300px" : "500px",
    background: "#183965",
    borderRadius: "4px"
  };

  const rowStyle = { marginBottom: "20px" };
  const labelStyle = { display: "inline-block", marginBottom: "5px", fontSize: "14px" };

  const inputBoxStyle = {
    width: "80px",
    marginLeft: "10px",
    textAlign: "right",
    fontFamily: "'DM Serif Display', serif",
    background: "white",
    color: "black",
    border: "1px solid #AAA",
    borderRadius: "4px",
    padding: "2px 5px"
  };

  const dropdownStyle = {
    width: "80px",
    marginRight: "10px",
    fontFamily: "'DM Serif Display', serif",
    background: "white",
    color: "black",
    border: "1px solid #AAA",
    borderRadius: "4px",
    padding: "2px 5px"
  };

  const topControlsStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "10px"
  };

  const ratioBoxStyle = {
    textAlign: "center",
    fontSize: "20px",
    marginTop: "10px",
    border: "1px solid white",
    background: "#183965",
    padding: "3px 5px",
    display: "inline-block",
    width: "150px"
  };

  const hrStyle = {
    border: "1px solid rgba(255,255,255,0.3)",
    margin: "20px 0"
  };

  const whatToBuyHeadingStyle = {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px"
  };

  // Desktop Layout
  const desktopLayout = (
    <div style={containerStyle}>
      <div style={leftPaneStyle}>
        <div>
          <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "18px", fontWeight: "bold" }}>
            Gold / Silver Ratio
          </h2>
          <div style={topControlsStyle}>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={dropdownStyle}
            >
              <option value="$">$</option>
              <option value="€">€</option>
            </select>
            <select
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value)}
              style={dropdownStyle}
            >
              <option value="oz">oz</option>
              <option value="g">g</option>
            </select>
            <div style={{ marginLeft: "10px", display: "flex", alignItems: "center" }}>
              <label style={{ fontSize: "14px", marginRight: "5px" }}>Lock Ratio:</label>
              <input
                type="checkbox"
                checked={ratioLock}
                onChange={handleLockToggle}
                style={{ transform: "scale(1.2)" }}
              />
            </div>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Gold Price ({currency}/{unit})</label>
            <br />
            <input
              type="text"
              value={goldInput}
              onChange={(e) => handleGoldInputChange(e.target.value)}
              onBlur={handleGoldBlur}
              style={inputBoxStyle}
            />
            <br />
            <input
              type="range"
              min={minGold}
              max={maxGold}
              step={goldStep}
              value={goldPrice}
              onChange={(e) => handleGoldSlider(e.target.value)}
              className="slider-thumb-gold w-full"
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Silver Price ({currency}/{unit})</label>
            <br />
            <input
              type="text"
              value={silverInput}
              onChange={(e) => handleSilverInputChange(e.target.value)}
              onBlur={handleSilverBlur}
              style={inputBoxStyle}
            />
            <br />
            <input
              type="range"
              min={minSilver}
              max={maxSilver}
              step={silverStep}
              value={silverPrice}
              onChange={(e) => handleSilverSlider(e.target.value)}
              className="slider-thumb-silver w-full"
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={ratioBoxStyle}>
              Ratio: <strong>{(goldPrice / silverPrice).toFixed(2)}</strong>
            </div>
          </div>
          <hr style={hrStyle} />
          <div style={whatToBuyHeadingStyle}>What We Buy</div>
          <BuySection ratio={ratio} />
        </div>
      </div>

      <div style={rightPaneStyle}>
        <ChartComponent ratio={ratio} chartData={chartData} isMobile={isMobile} />
      </div>
    </div>
  );

  // Mobile Layout
  const mobileLayout = (
    <div style={containerStyle}>
      {/* Ratio Controls */}
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "18px", fontWeight: "bold" }}>
          Gold / Silver Ratio
        </h2>
        <div style={topControlsStyle}>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={dropdownStyle}
          >
            <option value="$">$</option>
            <option value="€">€</option>
          </select>
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            style={dropdownStyle}
          >
            <option value="oz">oz</option>
            <option value="g">g</option>
          </select>
          <div style={{ marginLeft: "10px", display: "flex", alignItems: "center" }}>
            <label style={{ fontSize: "14px", marginRight: "5px" }}>Lock Ratio:</label>
            <input
              type="checkbox"
              checked={ratioLock}
              onChange={handleLockToggle}
              style={{ transform: "scale(1.2)" }}
            />
          </div>
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Gold Price ({currency}/{unit})</label>
          <br />
          <input
            type="text"
            value={goldInput}
            onChange={(e) => handleGoldInputChange(e.target.value)}
            onBlur={handleGoldBlur}
            style={inputBoxStyle}
          />
          <br />
          <input
            type="range"
            min={minGold}
            max={maxGold}
            step={goldStep}
            value={goldPrice}
            onChange={(e) => handleGoldSlider(e.target.value)}
            className="slider-thumb-gold w-full"
          />
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>Silver Price ({currency}/{unit})</label>
          <br />
          <input
            type="text"
            value={silverInput}
            onChange={(e) => handleSilverInputChange(e.target.value)}
            onBlur={handleSilverBlur}
            style={inputBoxStyle}
          />
          <br />
          <input
            type="range"
            min={minSilver}
            max={maxSilver}
            step={silverStep}
            value={silverPrice}
            onChange={(e) => handleSilverSlider(e.target.value)}
            className="slider-thumb-silver w-full"
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={ratioBoxStyle}>
            Ratio: <strong>{(goldPrice / silverPrice).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: "300px", marginBottom: "20px" }}>
        <ChartComponent ratio={ratio} chartData={chartData} isMobile={isMobile} />
      </div>

      {/* What We Buy */}
      <div style={{ width: "100%" }}>
        <hr style={hrStyle} />
        <div style={whatToBuyHeadingStyle}>What We Buy</div>
        <BuySection ratio={ratio} />
      </div>
    </div>
  );

  return isMobile ? mobileLayout : desktopLayout;
}

// Chart is factored out for clarity
function ChartComponent({ ratio, chartData, isMobile }) {
  // We define large vs. small label styles for "GOLD" and "SILVER"
  const largeLabelStyle = { fontSize: 48, fontWeight: "bold" };
  const smallLabelStyle = { fontSize: 24, fontWeight: "bold" };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData}>
        <defs>
          <linearGradient id="ratioGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(170,131,85,0.4)" />
            <stop offset="25%" stopColor="rgba(170,131,85,0.4)" />
            <stop offset="58.33%" stopColor="rgba(192,192,192,0.4)" />
            <stop offset="100%" stopColor="rgba(192,192,192,0.4)" />
          </linearGradient>
        </defs>

        <ReferenceArea x1={0} x2={1} y1={10} y2={130} fill="white" />
        <XAxis
          dataKey="x"
          type="number"
          domain={[0, 1]}
          axisLine={{ stroke: "black" }}
          tickLine={{ stroke: "black" }}
          hide={true}
        />
        <YAxis
          dataKey="ratioVal"
          type="number"
          domain={[10, 130]}
          ticks={[10,20,30,40,50,60,70,80,90,100,110,120,130]}
          axisLine={{ stroke: "black" }}
          tickLine={{ stroke: "black" }}
          tick={{ fill: "white" }}
        />
        <CartesianGrid horizontal={false} vertical={false} />
        <Area
          type="stepBefore"
          dataKey="ratioVal"
          stroke="none"
          fill="url(#ratioGradient)"
          fillOpacity={1}
        />
        <ReferenceLine y={40} stroke="black" strokeDasharray="3 3" />
        <ReferenceLine y={60} stroke="black" strokeDasharray="3 3" />
        <ReferenceLine y={80} stroke="black" strokeDasharray="3 3" />

        {/* GOLD label */}
        <ReferenceLine
          y={25}
          stroke="none"
          label={{
            value: "GOLD",
            position: "center",
            fill: "#AA8355",
            style: isMobile ? smallLabelStyle : largeLabelStyle
          }}
        />
        {/* SILVER label in solid color, also smaller on mobile */}
        <ReferenceLine
          y={105}
          stroke="none"
          label={{
            value: "SILVER",
            position: "center",
            fill: "#C0C0C0",
            style: isMobile ? smallLabelStyle : largeLabelStyle
          }}
        />
        <ReferenceLine
          y={ratio}
          stroke="black"
          strokeWidth={2}
          label={{
            value: `Ratio ${ratio.toFixed(2)}`,
            position: "center",
            fill: "black",
            dy: ratio >= 120 ? 10 : -10
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function BuySection({ ratio }) {
  let r = Math.max(10, Math.min(ratio, 130));
  const { gold: goldPct, silver: silverPct } = getBuyDistribution(r);

  const buySectionStyle = {
    display: "flex",
    justifyContent: "space-evenly",
    marginTop: "10px"
  };
  const goldBoxStyle = {
    background: "#AA8355",
    borderRadius: "4px",
    padding: "15px 25px",
    textAlign: "center",
    minWidth: "100px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: "20px",
    color: "black",
    border: "1px solid #AAA"
  };
  const silverBoxStyle = {
    background: "#C0C0C0",
    borderRadius: "4px",
    padding: "15px 25px",
    textAlign: "center",
    minWidth: "100px",
    fontFamily: "'DM Serif Display', serif",
    fontSize: "20px",
    color: "black",
    border: "1px solid #AAA"
  };

  return (
    <div style={buySectionStyle}>
      <div style={goldBoxStyle}>
        <div style={{ marginBottom: "5px" }}>Gold</div>
        <div>{goldPct}%</div>
      </div>
      <div style={silverBoxStyle}>
        <div style={{ marginBottom: "5px" }}>Silver</div>
        <div>{silverPct}%</div>
      </div>
    </div>
  );
}

function getBuyDistribution(r) {
  let goldPct = 0;
  let silverPct = 0;
  if (r <= 40) {
    goldPct = 100;
    silverPct = 0;
  } else if (r >= 80) {
    goldPct = 0;
    silverPct = 100;
  } else if (r === 60) {
    goldPct = 50;
    silverPct = 50;
  } else if (r > 40 && r < 60) {
    const prog = (r - 40) / 20;
    goldPct = 100 - 50 * prog;
    silverPct = 100 - goldPct;
  } else if (r > 60 && r < 80) {
    const prog = (r - 60) / 20;
    goldPct = 50 - 50 * prog;
    silverPct = 100 - goldPct;
  } else {
    goldPct = 50;
    silverPct = 50;
  }
  return { gold: Math.round(goldPct), silver: Math.round(silverPct) };
}

export default GoldSilverRatio;
