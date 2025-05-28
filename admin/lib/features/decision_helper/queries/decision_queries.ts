export async function addDecision(name: string) {
  const response = await fetch("/api/decision_helper/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type: "common_decision" }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add decision");
  }
  return response.json();
}

export async function updateDecision(id: string | number, name: string) {
  const response = await fetch(`/api/decision_helper/decisions?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type: "common_decision" }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update decision");
  }
  return response.json();
}

export async function deleteDecision(id: string | number) {
  const response = await fetch(`/api/decision_helper/decisions?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete decision");
  }
  return response;
}
