import matplotlib.pyplot as plt

class Result:
    def __init__(self, run_number, time):
        self.run_number = run_number
        self.time = time

file_path = "img/run3/results.txt"

with open(file_path, "r") as f:
    lines = f.readlines()

d = {}
current_run = 0
for line in lines:
    line = line.strip("\n")
    if not line or line.startswith("TOTAL") or line.startswith("SKIPPED") or "AVG" in line:
        continue
    elif line.startswith("RESULTS RUN"):
        current_run = int(line.split(" ")[2].strip(":"))
    else:
        file_name, time = line.split(": ")
        time = int(time.strip("\n"))
        if file_name not in d:
            d[file_name] = []
        d[file_name].append(Result(current_run, time))

# Line Graph
for file_name in d.keys():
    x = [result.run_number for result in d[file_name]]
    y = [result.time for result in d[file_name]]
    plt.plot(x, y, label=file_name)
    plt.legend()
    plt.xlabel("Run Number")
    plt.ylabel("Time (ms)")
    plt.title("Run Times")
    plt.savefig("line_graph.png")
plt.show()

# Boxplots
for file_name in d.keys():
    x = [result.time for result in d[file_name]]
    plt.boxplot(x)
    plt.title(file_name)
    plt.ylabel("Time (ms)")
    # Remove the 1 from the axis
    plt.xticks([])
    plt.savefig(f"{file_name}_boxplot.png")
    plt.show()


# Histogram
for file_name in d.keys():
    x = [result.time for result in d[file_name]]
    plt.hist(x)
    plt.title(file_name)
    plt.xlabel("Time (ms)")
    plt.ylabel("Frequency")
    plt.savefig(f"{file_name}_histogram.png")
    plt.show()
