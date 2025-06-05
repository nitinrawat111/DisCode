## Overview
We need a way to safely execute user submitted code. We know we can't execute code directly on top of our server.
![[Executing User Code 2024-10-24 19.02.51.excalidraw]]

## Requirements
### Functional Requirements
- Malicious Code should not affect our infrastructure. It should not be able to access sensitive files, resources, network of the machine it is executed on.
- Code should be executed with a dedicated amount resources. So that its performance is not affected by others or vice versa. Try to keep the resources uniform for each execution.
- We should be able to execute code with specific resource and time limits.

### Non-Functional Requirements
- It should be fast and efficient. Should not affect our latency drastically.
- Don't look for too much complicated or over engineered solution. We know we can't fully secure the system. So, try not to focus solely on preventing malicious activity. Also consider how we can minimize damage in case of a break out. Choose a solution with both simplicity and effectiveness in mind.

## Option 1: Chroot jail
- A **chroot jail** is a way to isolate a process and its children from the rest of the system by changing the apparent root directory of that process.
- We can execute code by spawning a new process inside a chroot jail.
- Difficulties:
	- But it is not so much secure and it is possible to break out of it. [Read Here](https://tbhaxor.com/breaking-out-of-chroot-jail-shell-environment/)
	- **chroot** only changes the file system view. It doesn’t isolate other resources, like memory or network settings. Processes can still see other processes running on the same OS, and they share CPU and memory without restrictions.
	- Even if we somehow prevent breaking out of it by restricting root access, it can still see other running process outside of chroot jail. [Read Here](https://unix.stackexchange.com/questions/306724/are-there-any-caveats-in-using-chroot)
- RAM, CPU and time restrictions can be easily applied using other methods but safety is still an issue.

## Option 2: seccomp
- **seccomp** (Secure Computing Mode) is a Linux kernel feature that restricts the system calls a process can make. [Read Here](https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/seccomp)
- Difficulties:
	- If an attacker finds a way to exploit a vulnerability in an allowed system call or if they can use an allowed call to perform an unauthorized action.
	- If there are vulnerabilities in the Linux kernel itself, attackers may exploit them to bypass Seccomp restrictions or escalate privileges.
## Option 3: Docker containers
- We can run user submitted code inside docker containers. In this way we might isolate the activity of the user within the container itself.
- Difficulties:
	- Docker container are not fully isolated ([Read Here](https://stackoverflow.com/questions/32257830/what-are-the-potential-security-problems-running-untrusted-code-in-a-docker-cont) ). We can take different security measures to prevent access to the host. [OWASP Docker Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
	- Even after taking such measures, there is a possibility of kernel exploit or a exploit in the Docker Engine itself. As the container will be running directly on top of host kernel, if somehow an user manages to perform a kernel exploit, they can gain unauthorized access to the Host System ([Example](https://unit42.paloaltonetworks.com/breaking-docker-via-runc-explaining-cve-2019-5736/)). However, possibility of this happening is very low.
	- Docker container may take some time to start up. But this can be solved. One way to solve this is discussed below.
- **Exclusive Containers:** If we start up a container for each code submission, it will take some time to start the container and then execute the code. It might increase the latency of the system.
- **Reusable Containers:** We can keep a pool of required containers already set up. And then execute the incoming code submissions on them. Although our latency will be reduced, but once a container has been compromised by malicious code, it will be difficult to detect it. Also, other people's code submission might run on a compromised container. Hence, we need a way to dismiss the docker container if it has been compromised and spin up a new one (before another code submission runs on it).
- Now, I don't think there is any foolproof method of detecting malicious activity on a container. So, why don't we delete each container as soon as it finishes. We can assure that a code will not run on compromised container and if so a container happens to be compromised, it will be deleted. But it again brings us back to first step of *exclusive containers*. 
- To address this, we can combine both solutions. We can have container pool available to save up on container startup times. When we receive a code submission, we run it on a container from the pool and start up a new container to take its place. Then, we can delete the container as soon as the intended code runs. This solution overcomes the challenges of both *exclusive and reusable containers*.
- The number of container in the pool will depend mostly on the fact that how many concurrent submissions we are going processing at a time.
![[Drawing 2024-10-29 03.42.17.excalidraw]]
- Overall, this approach seems like a promising solution for our problems. We can execute code safely (ignoring the case of kernel exploits) and that too with low latency.
- But we'll continue to look at other solutions for now. We might find something simpler and safer.
## Option 4: AWS Lambda
- We can run user submitted code on AWS Lambdas.
- Difficulties:
	- A Lambda instance is not destroyed upon completion and can be reused for future invocation. So, if a lambda instance is compromised, future submission might also be compromised.
	- Cold startup times
	- Supports only limited set of languages. Can be difficult for addition of new languages in future
## Option 5: Firecracker MicroVM
- We Traditional virtual machines (VMs) are too slow to start up and require a lot of resources. [Firecracker](https://github.com/firecracker-microvm/firecracker) seems like a faster option.
- With Firecracker, we can run user-submitted code in a lightweight VM environment, combining the speed of containers with the security of VMs. [Read Here](https://fly.io/blog/sandboxing-and-workload-isolation/)
- Firecracker starts up almost as fast as a container and this can be further optimized by using lightweight Linux images and configurations. We can either start them on the fly or make a pool, as we have already discussed with docker containers. We'll for now go with starting them on the fly, but if later it becomes a performance bottleneck , we might consider the VM Pool option.
- Firecracker provides strong VM-level isolation, making it safer to run untrusted code. However, for maximum security, we can take additional steps, like disabling network access and running Firecracker within a “jailer” environment.
- This might be an overkill for our requirement.
## Other Possible Solutions
- [Judge0](https://github.com/judge0/judge0)
	- Made exclusively for code execution
	- Open source
	- Would have gone with this. But for now, we will experiment and learn with custom solutions
- [isolate](https://github.com/ioi/isolate)
	- Used by Judge0 for isolation
	- Used by IOI for isolation
- Virtual Machines
	- Maximum Isolation
	- Performance Overhead
- gVisor
	- gVisor intercepts system calls made by programs and acts as the guest kernel running on top of host kernel.
	- This might help in dealing with kernel exploits and providing an ultra secure environment for executing untrusted code within a container.
	- However, this results in reduced application compatibility and higher per-system call overhead.
- AppArmor, SELinux
	- Both implement access control
	- Can be used with docker as mentioned in [OWASP Docker Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html) 

## Resources
[https://medium.com/free-code-camp/running-untrusted-javascript-as-a-saas-is-hard-this-is-how-i-tamed-the-demons-973870f76e1c](https://medium.com/free-code-camp/running-untrusted-javascript-as-a-saas-is-hard-this-is-how-i-tamed-the-demons-973870f76e1c)
https://fly.io/blog/sandboxing-and-workload-isolation/
https://www.figma.com/blog/server-side-sandboxing-an-introduction/
https://www.figma.com/blog/server-side-sandboxing-virtual-machines/
https://www.figma.com/blog/server-side-sandboxing-containers-and-seccomp/
https://jvns.ca/blog/2021/01/23/firecracker--start-a-vm-in-less-than-a-second/
https://www.researchgate.net/publication/346751837_Robust_and_Scalable_Online_Code_Execution_System
https://backoffice.biblio.ugent.be/download/8769638/8769643
https://brunoscheufler.com/blog/2022-10-02-running-untrusted-code-in-short-lived-environments



