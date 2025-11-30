import json
import plotly.graph_objects as go
from shapely import wkt


def to_list_xy(geom):
    """Convert any Shapely geometry (Polygon, LineString, Point) to x, y lists."""
    from shapely.geometry import Point, LineString, Polygon

    if isinstance(geom, Point):
        return [geom.x], [geom.y]
    elif isinstance(geom, LineString):
        x, y = geom.xy
        return list(x), list(y)
    elif isinstance(geom, Polygon):
        x, y = geom.exterior.xy
        return list(x), list(y)
    else:
        raise ValueError(f"Unsupported geometry type: {type(geom)}")

with open("map.json") as f:
    data = json.load(f)

fig = go.Figure()

counter = 1


for b in data["buildings"]:
    geom = wkt.loads(b["geometry"])
    x, y = to_list_xy(geom)

    fig.add_trace(go.Scatter(
        x=x, y=y,
        fill='toself',
        fillcolor="rgba(180,180,180,0.5)",
        line=dict(color="black", width=1),
        name=f"🏢 {b['name']}",
        hovertemplate=f"<b>Building:</b> {b['name']}<extra></extra>"
    ))

for b in data["buildings"]:
    for r in b["rooms"]:
        pt = wkt.loads(r["geometry"])

        fig.add_trace(go.Scatter(
            x=[pt.x], y=[pt.y],
            mode="markers+text",
            marker=dict(size=14, color="blue"),
            text=[str(counter)],
            textfont=dict(color="white", size=10),
            name=f"Room {counter}",
            hovertemplate=f"<b>Room:</b> {r['name']}<br>"
                          f"<b>ID:</b> {counter}<extra></extra>"
        ))

        counter += 1

for n in data["nodes"]:
    pt = wkt.loads(n["geometry"])

    fig.add_trace(go.Scatter(
        x=[pt.x], y=[pt.y],
        mode="markers+text",
        marker=dict(size=14, color="red"),
        text=[str(counter)],
        textfont=dict(color="white", size=10),
        name=f"Node {counter}",
        hovertemplate=f"<b>Node:</b> {n['name']}<br>"
                      f"<b>ID:</b> {counter}<extra></extra>"
    ))

    counter += 1


for p in data["paths"]:
    line = wkt.loads(p["geometry"])
    x, y = to_list_xy(line)

    fig.add_trace(go.Scatter(
        x=x, y=y,
        mode="lines",
        line=dict(color="green", width=2),
        name="Path",
        hoverinfo="skip"
    ))

fig.update_layout(
    title="Interactive Indoor Map",
    width=1400,
    height=900,
    showlegend=True,
    legend=dict(
        x=1.02,
        y=1,
        bgcolor="rgba(255,255,255,0.7)",
        bordercolor="gray",
        borderwidth=1
    ),
    margin=dict(l=50, r=200, t=60, b=50),
    xaxis=dict(visible=False),
    yaxis=dict(visible=False)
)

fig.show()
