
import sys, os

class Gabridamas:
    def __init__(self):
        print("--- [Orchestrator] Gabridamas Ready ---")

    def run_skill(self, skill, a1=None, a2=None):
        skills = {
            "write":  lambda: self.write_file(a1, a2),
            "find":   lambda: self.find_text(a1),
            "exec":   lambda: self.execute_script(a1),
            "log":    lambda: self.log_action(a1),
            "status": lambda: self.show_dashboard(),
            "check":  lambda: self.check_process()
        }
        
        if skill in skills:
            skills[skill]()
        else:
            print(f"  [Error] Skill '{skill}' not found.")

    def check_process(self):
        result = os.popen("pgrep -f chapter2.js").read()
        if result:
            print(f"  [Status] Sentinel is RUNNING (PID: {result.strip()})")
        else:
            print("  [Status] Sentinel is STOPPED or CRASHED.")

    def show_dashboard(self):
        print("--- [Gabridamas Dashboard] ---")
        if os.path.exists("sentinel_sim_ledger.json"):
            print("  [Status] Sentinel: ACTIVE (Data found)")
        else:
            print("  [Status] Sentinel: INACTIVE (No log found)")
        stat = os.statvfs(".")
        free_mb = (stat.f_bavail * stat.f_frsize) // (1024 * 1024)
        print(f"  [Status] Disk Space: {free_mb} MB free")
        print("------------------------------")

    def log_action(self, action):
        with open("gabri_history.txt", "a") as f:
            f.write(f"{action}\n")
        print(f"  [Worker] Logged: {action}")

    def write_file(self, f, c):
        with open(f, "w") as file: file.write(c)
        print(f"  [Worker] File '{f}' written.")

    def find_text(self, k):
        for f in [x for x in os.listdir(".") if x.endswith(('.txt', '.js'))]:
            with open(f, "r") as file:
                if k in file.read(): print(f"  [Worker] Match in: {f}")

    def execute_script(self, s):
        print(f"  [Worker] Running: {s}")
        os.system(f"node {s}")

if __name__ == "__main__":
    agent = Gabridamas()
    args = sys.argv[1:]
    if args: agent.run_skill(*args)
