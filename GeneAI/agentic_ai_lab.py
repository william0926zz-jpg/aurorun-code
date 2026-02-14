"""
Single-Step Healthcare Agentic AI 
----------------------------------------------------------
The agent:
1. Observes a user-provided patient snapshot
2. Estimates risk
3. Decides an action
4. Executes that action

"""

# -------------------------
# TOOLS (capabilities)
# -------------------------

def get_observation():
    """Tool: get one observation from the user."""
    print("\nEnter patient snapshot:")

    hr = int(input("Heart rate (bpm): "))
    spo2 = int(input("SpO2 (%): "))
    temp = float(input("Temperature (C): "))

    chest_pain = input("Chest pain? (y/n): ").lower() == "y"
    confusion = input("Confusion? (y/n): ").lower() == "y"
    short_breath = input("Shortness of breath? (y/n): ").lower() == "y"

    return {
        "hr": hr,
        "spo2": spo2,
        "temp": temp,
        "chest_pain": chest_pain,
        "confusion": confusion,
        "short_breath": short_breath
    }


def estimate_risk(obs):
    """
    Tool: estimate risk score (0-10) and explanation.
    """
    risk = 0
    reasons = []

    # Vitals
    if obs["hr"] < 50 or obs["hr"] > 125:
        risk += 3; reasons.append("HR extreme")
    elif obs["hr"] > 110:
        risk += 2; reasons.append("HR high")

    if obs["spo2"] < 90:
        risk += 4; reasons.append("Low SpO2")
    elif obs["spo2"] <= 92:
        risk += 2; reasons.append("Borderline SpO2")

    if obs["temp"] >= 39.0:
        risk += 2; reasons.append("High temperature")
    elif obs["temp"] >= 38.0:
        risk += 1; reasons.append("Elevated temperature")

    # Context flags
    if obs["short_breath"]:
        risk += 2; reasons.append("Shortness of breath")
    if obs["confusion"]:
        risk += 2; reasons.append("Confusion")
    if obs["chest_pain"]:
        risk += 2; reasons.append("Chest pain")

    risk = min(10, risk)

    if not reasons:
        reasons.append("No concerning indicators (sim)")

    return risk, ", ".join(reasons)


def send_alert(channel, obs, risk, reason):
    """Tool: simulate sending an alert."""
    print(f"\n>>> ALERT SENT TO {channel.upper()}")
    print(f"Risk: {risk}")
    print(f"Observation: {obs}")
    print(f"Reason: {reason}")


# -------------------------
# POLICY (decision logic)
# -------------------------

def decide_action(risk):
    """
    Policy:
    - Priority overrides for high risk
    - Otherwise choose proportionate response
    """
    if risk >= 9:
        return "emergency", "Very high risk (priority override)"
    if risk >= 7:
        return "escalate", "High risk — clinician review needed"
    if risk >= 4:
        return "alert", "Moderate risk — notify nurse"
    return "monitor", "Low risk — continue monitoring"


# -------------------------
# ORCHESTRATOR (single step)
# -------------------------

def run_agent_once():
    """
    Orchestrator:
    - Calls tools in order
    - Applies policy
    - Enforces human-in-the-loop check
    """

    print("\n=== Healthcare Agent ===")

    # 1. Observe
    observation = get_observation()

    # 2. Evaluate
    risk, risk_reason = estimate_risk(observation)

    # 3. Decide
    action, policy_reason = decide_action(risk)

    # 4. Human-in-the-loop for high-severity actions
    if action in ("escalate", "emergency"):
        confirm = input(f"\nConfirm {action.upper()}? (y/n): ").lower()
        if confirm != "y":
            action = "monitor"
            final_reason = "High-severity action not confirmed by human"
        else:
            final_reason = f"{risk_reason} | {policy_reason}"
    else:
        final_reason = f"{risk_reason} | {policy_reason}"

    # 5. Act
    print(f"\nACTION DECISION: {action.upper()}")
    print(f"Risk score: {risk}")
    print(f"Explanation: {final_reason}")

    if action == "monitor":
        print("\n>>> No alert sent. Monitoring only (sim).")
    elif action == "alert":
        send_alert("nurse", observation, risk, final_reason)
    elif action == "escalate":
        send_alert("clinician", observation, risk, final_reason)
    elif action == "emergency":
        send_alert("emergency_response", observation, risk, final_reason)




if __name__ == "__main__":
    run_agent_once()
