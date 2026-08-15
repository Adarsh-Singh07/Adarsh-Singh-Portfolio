Compress-Archive -Path "E:\Projects\Adarsh-Singh-Portfolio\backend\*" -DestinationPath "backend.zip" -Force
scp -i "C:\Users\adars\Downloads\SecretKeys\portfolio-vps.key" -o StrictHostKeyChecking=no backend.zip ubuntu@168.107.71.100:/home/ubuntu/
ssh -i "C:\Users\adars\Downloads\SecretKeys\portfolio-vps.key" -o StrictHostKeyChecking=no ubuntu@168.107.71.100 "unzip -o /home/ubuntu/backend.zip -d /home/ubuntu/portfolio/backend/ && sudo systemctl restart portfolio && sudo systemctl status portfolio --no-pager"
