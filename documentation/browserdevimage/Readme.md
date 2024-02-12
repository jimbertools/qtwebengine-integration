# How to develop on jack

Build or find this image  
Run following command on jack
```bash
docker run -tid --network=proxy \
  -v "$PWD:/opt/code" \
  --name=name-browserdev \
  --cap-add sys_ptrace \
  --restart=always browserdevimage tail -f /dev/null
  ```